import { type NextRequest, NextResponse } from "next/server"
import { PaymentGatewayManager } from "@/lib/payment-gateway"
import { pool } from "@/lib/database"
import { EscrowManager } from "@/lib/escrow"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference, gateway } = body

    if (!reference || !gateway) {
      return NextResponse.json({ error: "Reference and gateway are required" }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      // Get payment transaction
      const transactionResult = await client.query("SELECT * FROM payment_transactions WHERE transaction_ref = $1", [
        reference,
      ])

      if (transactionResult.rows.length === 0) {
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
      }

      const transaction = transactionResult.rows[0]

      // Verify payment with gateway
      const paymentManager = PaymentGatewayManager.getInstance()
      const verification = await paymentManager.verifyPayment(gateway, reference)

      if (verification.success && verification.status === "success") {
        // Update transaction status
        await client.query(
          "UPDATE payment_transactions SET status = $1, gateway_response = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
          ["completed", JSON.stringify(verification), transaction.id],
        )

        // Update trade status
        await client.query("UPDATE trades SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [
          "payment_confirmed",
          transaction.trade_id,
        ])

        // If this is a buy order, release escrow
        const tradeResult = await client.query("SELECT * FROM trades WHERE id = $1", [transaction.trade_id])
        const trade = tradeResult.rows[0]

        if (trade.buyer_id === transaction.user_id) {
          const escrowManager = EscrowManager.getInstance()
          await escrowManager.releaseEscrow(trade.id, transaction.user_id, "buyer")
        }

        return NextResponse.json({
          success: true,
          message: "Payment verified successfully",
          status: "completed",
        })
      } else {
        // Update transaction status to failed
        await client.query(
          "UPDATE payment_transactions SET status = $1, gateway_response = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
          ["failed", JSON.stringify(verification), transaction.id],
        )

        return NextResponse.json({
          success: false,
          message: "Payment verification failed",
          status: "failed",
        })
      }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
