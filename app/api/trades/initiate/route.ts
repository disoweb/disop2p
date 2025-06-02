import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { pool } from "@/lib/database"
import { EscrowManager } from "@/lib/escrow"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    const body = await request.json()
    const { orderId, amount } = body

    if (!orderId || !amount) {
      return NextResponse.json({ error: "Order ID and amount are required" }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      // Get order details
      const orderResult = await client.query("SELECT * FROM orders WHERE id = $1 AND status = 'active'", [orderId])

      if (orderResult.rows.length === 0) {
        return NextResponse.json({ error: "Order not found or not active" }, { status: 404 })
      }

      const order = orderResult.rows[0]

      // Validate amount is within limits
      const tradeAmount = Number.parseFloat(amount)
      if (tradeAmount < order.min_limit || tradeAmount > order.max_limit) {
        return NextResponse.json(
          { error: `Amount must be between ₦${order.min_limit} and ₦${order.max_limit}` },
          { status: 400 },
        )
      }

      // Calculate crypto amount
      const cryptoAmount = tradeAmount / order.rate

      // Determine buyer and seller
      const buyerId = order.type === "sell" ? userId : order.user_id
      const sellerId = order.type === "sell" ? order.user_id : userId

      // Create trade
      const tradeResult = await client.query(
        `INSERT INTO trades (order_id, buyer_id, seller_id, cryptocurrency, amount, rate, total_amount, payment_method, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          orderId,
          buyerId,
          sellerId,
          order.cryptocurrency,
          cryptoAmount,
          order.rate,
          tradeAmount,
          order.payment_method,
          "pending",
        ],
      )

      const trade = tradeResult.rows[0]

      // Create escrow for sell orders
      if (order.type === "sell") {
        const escrowManager = EscrowManager.getInstance()
        await escrowManager.createEscrow(trade.id, sellerId, cryptoAmount, order.cryptocurrency)
      }

      // Send notifications via WebSocket
      // Note: WebSocket manager would be initialized in the main server
      // For now, we'll just return success

      return NextResponse.json({
        success: true,
        trade: {
          id: trade.id,
          cryptocurrency: trade.cryptocurrency,
          amount: trade.amount,
          rate: trade.rate,
          totalAmount: trade.total_amount,
          paymentMethod: trade.payment_method,
          status: trade.status,
        },
        message: "Trade initiated successfully",
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Trade initiation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
