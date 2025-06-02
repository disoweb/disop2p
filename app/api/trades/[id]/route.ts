import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    // Get trade details
    const tradeResult = await sql`
      SELECT t.*, 
             u1.first_name || ' ' || u1.last_name as buyer_name,
             u2.first_name || ' ' || u2.last_name as seller_name,
             u1.rating as buyer_rating,
             u2.rating as seller_rating,
             u1.total_trades as buyer_trades,
             u2.total_trades as seller_trades
      FROM trades t
      LEFT JOIN users u1 ON t.buyer_id = u1.id
      LEFT JOIN users u2 ON t.seller_id = u2.id
      WHERE t.id = ${params.id} 
      AND (t.buyer_id = ${userId} OR t.seller_id = ${userId})
    `

    if (tradeResult.length === 0) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 })
    }

    const trade = tradeResult[0]
    const isUserBuyer = trade.buyer_id === userId

    // Format trade data
    const formattedTrade = {
      id: trade.id,
      type: isUserBuyer ? "buy" : "sell",
      crypto: trade.cryptocurrency,
      amount: trade.amount,
      rate: `₦${Number(trade.rate).toLocaleString()}`,
      total: `₦${Number(trade.total_amount).toLocaleString()}`,
      fee: `₦${Number(trade.fee || 0).toLocaleString()}`,
      status: trade.status,
      createdAt: trade.created_at,
      partner: {
        name: isUserBuyer ? trade.seller_name : trade.buyer_name,
        rating: isUserBuyer ? trade.seller_rating : trade.buyer_rating,
        trades: isUserBuyer ? trade.seller_trades : trade.buyer_trades,
      },
      paymentDetails: trade.payment_details ? JSON.parse(trade.payment_details) : null,
    }

    return NextResponse.json({ trade: formattedTrade })
  } catch (error) {
    console.error("Error fetching trade:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
