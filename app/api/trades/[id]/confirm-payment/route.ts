import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { neon } from "@neondatabase/serverless"
import { EscrowManager } from "@/lib/escrow"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    // Verify user is the seller of this trade
    const tradeCheck = await sql`
      SELECT * FROM trades 
      WHERE id = ${params.id} 
      AND seller_id = ${userId}
      AND status = 'payment_pending'
    `

    if (tradeCheck.length === 0) {
      return NextResponse.json({ error: "Trade not found or not authorized" }, { status: 404 })
    }

    const trade = tradeCheck[0]

    // Release escrow funds
    const escrowManager = EscrowManager.getInstance()
    await escrowManager.releaseEscrow(params.id, userId, "seller")

    // Update trade status
    await sql`
      UPDATE trades 
      SET status = 'completed', 
          completed_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
    `

    // Add system message
    await sql`
      INSERT INTO messages (trade_id, sender_id, content, is_system)
      VALUES (${params.id}, ${userId}, 'Payment confirmed. Trade completed successfully!', true)
    `

    return NextResponse.json({ message: "Payment confirmed and trade completed" })
  } catch (error) {
    console.error("Error confirming payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
