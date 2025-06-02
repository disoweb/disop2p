import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { PaymentGatewayManager } from "@/lib/payment-gateway"
import { pool } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    const body = await request.json()
    const { tradeId, gateway, amount, email } = body

    if (!tradeId || !gateway || !amount || !email) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      // Verify trade exists and user is authorized
      const tradeResult = await client.query(
        "SELECT * FROM trades WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2)",
        [tradeId, userId],
      )

      if (tradeResult.rows.length === 0) {
        return NextResponse.json({ error: "Trade not found or unauthorized" }, { status: 404 })
      }

      const trade = tradeResult.rows[0]

      // Generate unique reference
      const reference = `trade_${tradeId}_${Date.now()}`

      // Initialize payment
      const paymentManager = PaymentGatewayManager.getInstance()
      const result = await paymentManager.initializePayment(gateway, {
        amount,
        currency: "NGN",
        email,
        reference,
        callback_url: `${process.env.FRONTEND_URL}/api/payments/callback`,
      })

      if (result.success) {
        // Store payment transaction
        await client.query(
          `INSERT INTO payment_transactions (trade_id, user_id, gateway, transaction_ref, amount, status)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [tradeId, userId, gateway, reference, amount, "pending"],
        )

        return NextResponse.json({
          success: true,
          authorizationUrl: result.authorization_url,
          reference: result.reference,
          message: result.message,
        })
      } else {
        return NextResponse.json({ error: result.message }, { status: 400 })
      }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Payment initialization error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
