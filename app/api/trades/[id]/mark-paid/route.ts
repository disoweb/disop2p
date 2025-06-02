import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    // Verify user is the buyer of this trade
    const tradeCheck = await sql`
      SELECT * FROM trades 
      WHERE id = ${params.id} 
      AND buyer_id = ${userId}
      AND status = 'active'
    `

    if (tradeCheck.length === 0) {
      return NextResponse.json({ error: "Trade not found or not authorized" }, { status: 404 })
    }

    // Update trade status
    await sql`
      UPDATE trades 
      SET status = 'payment_pending', 
          payment_marked_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
    `

    // Add system message
    await sql`
      INSERT INTO messages (trade_id, sender_id, content, is_system)
      VALUES (${params.id}, ${userId}, 'Payment has been marked as sent by buyer', true)
    `

    return NextResponse.json({ message: "Payment marked successfully" })
  } catch (error) {
    console.error("Error marking payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
