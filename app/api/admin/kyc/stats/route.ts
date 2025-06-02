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

    const stats = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE verification_status = 'pending') as pending,
        COUNT(*) FILTER (WHERE verification_status = 'verified') as verified,
        COUNT(*) FILTER (WHERE verification_status = 'rejected') as rejected,
        COUNT(*) as total
      FROM kyc_documents
    `

    return NextResponse.json({
      success: true,
      data: {
        pending: Number.parseInt(stats[0].pending),
        verified: Number.parseInt(stats[0].verified),
        rejected: Number.parseInt(stats[0].rejected),
        total: Number.parseInt(stats[0].total),
      },
    })
  } catch (error) {
    console.error("Error fetching KYC stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
