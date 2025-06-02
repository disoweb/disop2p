import { Server as SocketIOServer } from "socket.io"
import type { Server as HTTPServer } from "http"
import jwt from "jsonwebtoken"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export class EnhancedWebSocketManager {
  private io: SocketIOServer
  private userSockets: Map<string, string> = new Map()
  private adminSockets: Set<string> = new Set()

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
        const result = await sql`SELECT * FROM users WHERE id = ${decoded.userId}`

        if (result.length === 0) {
          return next(new Error("User not found"))
        }

        socket.userId = decoded.userId
        socket.user = result[0]
        next()
      } catch (error) {
        next(new Error("Authentication error"))
      }
    })
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket) => {
      console.log(`User ${socket.userId} connected`)
      this.userSockets.set(socket.userId, socket.id)

      // Track admin users
      if (socket.user.role === "admin") {
        this.adminSockets.add(socket.id)
        socket.join("admin")
      }

      // Join user to their personal room
      socket.join(`user:${socket.userId}`)

      // Handle wallet updates subscription
      socket.on("subscribe_wallet_updates", () => {
        socket.join(`wallet:${socket.userId}`)
      })

      // Handle KYC updates subscription
      socket.on("subscribe_kyc_updates", () => {
        socket.join(`kyc:${socket.userId}`)
      })

      // Handle admin KYC updates subscription
      socket.on("subscribe_admin_kyc", () => {
        if (socket.user.role === "admin") {
          socket.join("admin_kyc")
        }
      })

      // Handle notification updates
      socket.on("mark_notification_read", async (notificationId: string) => {
        try {
          await sql`
            UPDATE notifications 
            SET is_read = true 
            WHERE id = ${notificationId} AND user_id = ${socket.userId}
          `

          socket.emit("notification_marked_read", { notificationId })
        } catch (error) {
          socket.emit("error", { message: "Failed to mark notification as read" })
        }
      })

      // Handle mark all notifications as read
      socket.on("mark_all_notifications_read", async () => {
        try {
          await sql`
            UPDATE notifications 
            SET is_read = true 
            WHERE user_id = ${socket.userId} AND is_read = false
          `

          socket.emit("all_notifications_marked_read")
        } catch (error) {
          socket.emit("error", { message: "Failed to mark notifications as read" })
        }
      })

      socket.on("disconnect", () => {
        console.log(`User ${socket.userId} disconnected`)
        this.userSockets.delete(socket.userId)
        this.adminSockets.delete(socket.id)
      })
    })
  }

  // Enhanced notification system
  public async sendNotification(userId: string, notification: any): Promise<void> {
    try {
      // Store notification in database
      const result = await sql`
        INSERT INTO notifications (user_id, title, message, type, data)
        VALUES (${userId}, ${notification.title}, ${notification.message}, ${notification.type}, ${JSON.stringify(notification.data || {})})
        RETURNING *
      `

      // Send real-time notification if user is online
      const socketId = this.userSockets.get(userId)
      if (socketId) {
        this.io.to(socketId).emit("notification", {
          ...result[0],
          data: JSON.parse(result[0].data || "{}"),
        })
      }
    } catch (error) {
      console.error("Error sending notification:", error)
    }
  }

  // Broadcast wallet updates
  public async broadcastWalletUpdate(userId: string, walletData: any): Promise<void> {
    this.io.to(`wallet:${userId}`).emit("wallet_updated", walletData)
  }

  // Broadcast KYC updates
  public async broadcastKYCUpdate(userId: string, kycData: any): Promise<void> {
    this.io.to(`kyc:${userId}`).emit("kyc_updated", kycData)

    // Also notify admins of new KYC submissions
    if (kycData.status === "pending") {
      this.io.to("admin_kyc").emit("new_kyc_submission", {
        userId,
        ...kycData,
      })
    }
  }

  // Broadcast admin notifications
  public async broadcastToAdmins(event: string, data: any): Promise<void> {
    this.io.to("admin").emit(event, data)
  }

  public getIO() {
    return this.io
  }
}
