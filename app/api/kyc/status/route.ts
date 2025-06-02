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
    const userId = decoded.userId

    const user = await sql`
      SELECT kyc_status, kyc_level, is_verified FROM users WHERE id = ${userId}
    `

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const documents = await sql`
      SELECT document_type, verification_status, created_at FROM kyc_documents
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      success: true,
      data: {
        status: user[0].kyc_status,
        level: user[0].kyc_level,
        isVerified: user[0].is_verified,
        documents,
      },
    })
  } catch (error) {
    console.error("Error fetching KYC status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
