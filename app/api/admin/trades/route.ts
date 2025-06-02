import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || ""

    const offset = (page - 1) * limit

    // Build query conditions
    const whereConditions = []
    const queryParams = []
    let paramIndex = 1

    if (status) {
      whereConditions.push(`t.status = $${paramIndex}`)
      queryParams.push(status)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM trades t ${whereClause}`
    const countResult = await sql(countQuery, queryParams)
    const total = Number.parseInt(countResult[0].total)

    // Get trades with user information
    const tradesQuery = `
      SELECT 
        t.id, t.cryptocurrency, t.amount, t.rate, t.total_amount,
        t.payment_method, t.status, t.escrow_address, t.escrow_amount,
        t.created_at, t.completed_at,
        buyer.first_name as buyer_first_name, buyer.last_name as buyer_last_name,
        seller.first_name as seller_first_name, seller.last_name as seller_last_name,
        o.type as order_type
      FROM trades t
      LEFT JOIN users buyer ON t.buyer_id = buyer.id
      LEFT JOIN users seller ON t.seller_id = seller.id
      LEFT JOIN orders o ON t.order_id = o.id
      ${whereClause}
      ORDER BY t.created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    queryParams.push(limit, offset)
    const trades = await sql(tradesQuery, queryParams)

    return NextResponse.json({
      success: true,
      data: {
        trades,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("Error fetching trades:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { tradeId, action, data } = body

    if (!tradeId || !action) {
      return NextResponse.json({ error: "Trade ID and action are required" }, { status: 400 })
    }

    switch (action) {
      case "resolve_dispute":
        const { resolution } = data
        await sql("UPDATE trades SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = $1", [tradeId])

        // Update dispute record
        await sql(
          "UPDATE disputes SET status = 'resolved', resolution = $1, resolved_at = CURRENT_TIMESTAMP WHERE trade_id = $2",
          [resolution, tradeId],
        )
        break

      case "cancel_trade":
        await sql("UPDATE trades SET status = 'cancelled' WHERE id = $1", [tradeId])
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Trade updated successfully" })
  } catch (error) {
    console.error("Error updating trade:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
