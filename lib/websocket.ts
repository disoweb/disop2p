import { Server as SocketIOServer } from "socket.io"
import type { Server as HTTPServer } from "http"
import jwt from "jsonwebtoken"
import { pool } from "./database"

export class WebSocketManager {
  private io: SocketIOServer
  private userSockets: Map<string, string> = new Map()

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    })

    this.setupMiddleware()
    this.setupEventHandlers()
  }

  private setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token
        if (!token) {
          return next(new Error("Authentication error"))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
        const client = await pool.connect()

        try {
          const result = await client.query("SELECT * FROM users WHERE id = $1", [decoded.userId])
          if (result.rows.length === 0) {
            return next(new Error("User not found"))
          }

          socket.userId = decoded.userId
          socket.user = result.rows[0]
          next()
        } finally {
          client.release()
        }
      } catch (error) {
        next(new Error("Authentication error"))
      }
    })
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket) => {
      console.log(`User ${socket.userId} connected`)
      this.userSockets.set(socket.userId, socket.id)

      // Join user to their personal room
      socket.join(`user:${socket.userId}`)

      // Handle joining trade rooms
      socket.on("join_trade", (tradeId: string) => {
        socket.join(`trade:${tradeId}`)
      })

      // Handle leaving trade rooms
      socket.on("leave_trade", (tradeId: string) => {
        socket.leave(`trade:${tradeId}`)
      })

      // Handle sending messages
      socket.on("send_message", async (data) => {
        try {
          await this.handleMessage(socket, data)
        } catch (error) {
          socket.emit("error", { message: "Failed to send message" })
        }
      })

      // Handle trade status updates
      socket.on("update_trade_status", async (data) => {
        try {
          await this.handleTradeStatusUpdate(socket, data)
        } catch (error) {
          socket.emit("error", { message: "Failed to update trade status" })
        }
      })

      // Handle typing indicators
      socket.on("typing", (data) => {
        socket.to(`trade:${data.tradeId}`).emit("user_typing", {
          userId: socket.userId,
          userName: socket.user.first_name,
        })
      })

      socket.on("stop_typing", (data) => {
        socket.to(`trade:${data.tradeId}`).emit("user_stop_typing", {
          userId: socket.userId,
        })
      })

      socket.on("disconnect", () => {
        console.log(`User ${socket.userId} disconnected`)
        this.userSockets.delete(socket.userId)
      })
    })
  }

  private async handleMessage(socket: any, data: any) {
    const client = await pool.connect()

    try {
      // Verify user is part of the trade
      const tradeResult = await client.query(
        "SELECT * FROM trades WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2)",
        [data.tradeId, socket.userId],
      )

      if (tradeResult.rows.length === 0) {
        throw new Error("Unauthorized")
      }

      // Insert message
      const messageResult = await client.query(
        `INSERT INTO messages (trade_id, sender_id, message, message_type, attachment_url)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [data.tradeId, socket.userId, data.message, data.type || "text", data.attachmentUrl],
      )

      const message = {
        ...messageResult.rows[0],
        sender_name: socket.user.first_name + " " + socket.user.last_name,
      }

      // Broadcast to trade room
      this.io.to(`trade:${data.tradeId}`).emit("new_message", message)

      // Send push notification to other party
      const trade = tradeResult.rows[0]
      const recipientId = trade.buyer_id === socket.userId ? trade.seller_id : trade.buyer_id
      await this.sendNotification(recipientId, {
        title: "New Message",
        message: `${socket.user.first_name} sent you a message`,
        type: "message",
        data: { tradeId: data.tradeId },
      })
    } finally {
      client.release()
    }
  }

  private async handleTradeStatusUpdate(socket: any, data: any) {
    const client = await pool.connect()

    try {
      // Update trade status
      const result = await client.query(
        "UPDATE trades SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND (buyer_id = $3 OR seller_id = $3) RETURNING *",
        [data.status, data.tradeId, socket.userId],
      )

      if (result.rows.length === 0) {
        throw new Error("Unauthorized or trade not found")
      }

      const trade = result.rows[0]

      // Broadcast status update
      this.io.to(`trade:${data.tradeId}`).emit("trade_status_updated", {
        tradeId: data.tradeId,
        status: data.status,
        updatedBy: socket.userId,
      })

      // Send notification to other party
      const recipientId = trade.buyer_id === socket.userId ? trade.seller_id : trade.buyer_id
      await this.sendNotification(recipientId, {
        title: "Trade Update",
        message: `Trade status updated to ${data.status}`,
        type: "trade_update",
        data: { tradeId: data.tradeId, status: data.status },
      })
    } finally {
      client.release()
    }
  }

  public async sendNotification(userId: string, notification: any) {
    const client = await pool.connect()

    try {
      // Store notification in database
      await client.query(
        "INSERT INTO notifications (user_id, title, message, type, data) VALUES ($1, $2, $3, $4, $5)",
        [userId, notification.title, notification.message, notification.type, JSON.stringify(notification.data)],
      )

      // Send real-time notification if user is online
      const socketId = this.userSockets.get(userId)
      if (socketId) {
        this.io.to(socketId).emit("notification", notification)
      }

      // TODO: Send push notification to mobile device
    } finally {
      client.release()
    }
  }

  public getIO() {
    return this.io
  }
}
