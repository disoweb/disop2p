import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    // Check if user is admin
    const admin = await sql`
      SELECT role FROM users WHERE id = ${decoded.userId} AND role = 'admin'
    `

    if (admin.length === 0) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "pending"
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || "all"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    let whereClause = `WHERE kd.verification_status = ${status}`

    if (search) {
      whereClause += ` AND (u.first_name ILIKE '%${search}%' OR u.last_name ILIKE '%${search}%' OR u.email ILIKE '%${search}%' OR kd.document_number ILIKE '%${search}%')`
    }

    if (type !== "all") {
      whereClause += ` AND kd.document_type = '${type}'`
    }

    const documents = await sql`
      SELECT 
        kd.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.kyc_level,
        u.created_at as user_created_at
      FROM kyc_documents kd
      JOIN users u ON kd.user_id = u.id
      ${sql.unsafe(whereClause)}
      ORDER BY kd.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    return NextResponse.json({
      success: true,
      data: documents,
    })
  } catch (error) {
    console.error("Error fetching KYC documents:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
