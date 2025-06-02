import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { documentId, action, reason } = body

    if (!documentId || !action) {
      return NextResponse.json({ error: "Document ID and action are required" }, { status: 400 })
    }

    // Get document details
    const document = await sql`
      SELECT kd.*, u.first_name, u.last_name FROM kyc_documents kd
      JOIN users u ON kd.user_id = u.id
      WHERE kd.id = ${documentId}
    `

    if (document.length === 0) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    const doc = document[0]

    if (action === "approve") {
      // Approve document
      await sql`
        UPDATE kyc_documents 
        SET verification_status = 'verified', verified_at = CURRENT_TIMESTAMP, verified_by = ${decoded.userId}
        WHERE id = ${documentId}
      `

      // Update user KYC level
      const verifiedDocs = await sql`
        SELECT COUNT(*) as count FROM kyc_documents
        WHERE user_id = ${doc.user_id} AND verification_status = 'verified'
      `

      const verifiedCount = Number.parseInt(verifiedDocs[0].count)
      const kycLevel = Math.min(verifiedCount, 3)
      const isVerified = kycLevel >= 2

      await sql`
        UPDATE users 
        SET kyc_level = ${kycLevel}, is_verified = ${isVerified}, kyc_status = 'verified'
        WHERE id = ${doc.user_id}
      `

      // Send notification
      await sql`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (${doc.user_id}, 'KYC Approved', 'Your ${doc.document_type.replace("_", " ")} has been approved', 'kyc')
      `
    } else if (action === "reject") {
      // Reject document
      await sql`
        UPDATE kyc_documents 
        SET verification_status = 'rejected', verified_at = CURRENT_TIMESTAMP, verified_by = ${decoded.userId}
        WHERE id = ${documentId}
      `

      // Send notification
      await sql`
        INSERT INTO notifications (user_id, title, message, type, data)
        VALUES (${doc.user_id}, 'KYC Rejected', 'Your ${doc.document_type.replace("_", " ")} was rejected', 'kyc', ${JSON.stringify({ reason })})
      `
    }

    return NextResponse.json({
      success: true,
      message: `Document ${action}d successfully`,
    })
  } catch (error) {
    console.error("KYC approval error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
