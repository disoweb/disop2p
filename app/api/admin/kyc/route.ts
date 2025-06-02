import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || "pending"

    const offset = (page - 1) * limit

    // Get KYC documents with user information
    const kycQuery = `
      SELECT 
        kd.id, kd.document_type, kd.document_number, kd.document_url,
        kd.verification_status, kd.created_at, kd.verified_at,
        u.first_name, u.last_name, u.email, u.kyc_level
      FROM kyc_documents kd
      LEFT JOIN users u ON kd.user_id = u.id
      WHERE kd.verification_status = $1
      ORDER BY kd.created_at DESC 
      LIMIT $2 OFFSET $3
    `

    const kycDocuments = await sql(kycQuery, [status, limit, offset])

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM kyc_documents WHERE verification_status = $1`
    const countResult = await sql(countQuery, [status])
    const total = Number.parseInt(countResult[0].total)

    return NextResponse.json({
      success: true,
      data: {
        documents: kycDocuments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("Error fetching KYC documents:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { documentId, action, adminId } = body

    if (!documentId || !action) {
      return NextResponse.json({ error: "Document ID and action are required" }, { status: 400 })
    }

    // Get document and user information
    const docResult = await sql("SELECT user_id, document_type FROM kyc_documents WHERE id = $1", [documentId])

    if (docResult.length === 0) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    const { user_id, document_type } = docResult[0]

    switch (action) {
      case "approve":
        // Update document status
        await sql(
          "UPDATE kyc_documents SET verification_status = 'verified', verified_at = CURRENT_TIMESTAMP, verified_by = $1 WHERE id = $2",
          [adminId, documentId],
        )

        // Update user KYC level
        const userResult = await sql("SELECT kyc_level FROM users WHERE id = $1", [user_id])
        const currentLevel = userResult[0]?.kyc_level || 0
        const newLevel = Math.min(currentLevel + 1, 3)

        await sql("UPDATE users SET kyc_level = $1, kyc_status = $2, is_verified = $3 WHERE id = $4", [
          newLevel,
          newLevel >= 2 ? "verified" : "pending",
          newLevel >= 2,
          user_id,
        ])
        break

      case "reject":
        await sql(
          "UPDATE kyc_documents SET verification_status = 'rejected', verified_at = CURRENT_TIMESTAMP, verified_by = $1 WHERE id = $2",
          [adminId, documentId],
        )
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Document updated successfully" })
  } catch (error) {
    console.error("Error updating KYC document:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
