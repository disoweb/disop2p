import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""

    const offset = (page - 1) * limit

    // Build query conditions
    const whereConditions = []
    const queryParams = []
    let paramIndex = 1

    if (search) {
      whereConditions.push(
        `(first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`,
      )
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    if (status) {
      whereConditions.push(`kyc_status = $${paramIndex}`)
      queryParams.push(status)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`
    const countResult = await sql(countQuery, queryParams)
    const total = Number.parseInt(countResult[0].total)

    // Get users with pagination
    const usersQuery = `
      SELECT 
        id, first_name, last_name, email, phone, 
        kyc_status, kyc_level, is_verified, is_active,
        rating, total_trades, successful_trades, total_volume,
        created_at, updated_at
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    queryParams.push(limit, offset)
    const users = await sql(usersQuery, queryParams)

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action, data } = body

    if (!userId || !action) {
      return NextResponse.json({ error: "User ID and action are required" }, { status: 400 })
    }

    switch (action) {
      case "suspend":
        await sql("UPDATE users SET is_active = false WHERE id = $1", [userId])
        break

      case "activate":
        await sql("UPDATE users SET is_active = true WHERE id = $1", [userId])
        break

      case "update_kyc":
        const { kycStatus, kycLevel } = data
        await sql("UPDATE users SET kyc_status = $1, kyc_level = $2, is_verified = $3 WHERE id = $4", [
          kycStatus,
          kycLevel,
          kycLevel >= 2,
          userId,
        ])
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "User updated successfully" })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
