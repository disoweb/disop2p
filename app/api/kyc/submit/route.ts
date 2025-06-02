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
    const userId = decoded.userId

    const body = await request.json()
    const { personalInfo, documents } = body

    if (!personalInfo || !documents || documents.length === 0) {
      return NextResponse.json({ error: "Personal information and documents are required" }, { status: 400 })
    }

    // Update user personal information
    await sql`
      UPDATE users 
      SET first_name = ${personalInfo.firstName},
          last_name = ${personalInfo.lastName},
          bvn = ${personalInfo.bvn || null},
          state = ${personalInfo.state},
          city = ${personalInfo.city},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `

    // Submit KYC documents
    for (const document of documents) {
      await sql`
        INSERT INTO kyc_documents (user_id, document_type, document_number, document_url, verification_status)
        VALUES (${userId}, ${document.type}, ${document.number}, ${document.url}, 'pending')
        ON CONFLICT (user_id, document_type) 
        DO UPDATE SET 
          document_number = EXCLUDED.document_number,
          document_url = EXCLUDED.document_url,
          verification_status = 'pending',
          created_at = CURRENT_TIMESTAMP
      `
    }

    // Send notification to user
    await sql`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (${userId}, 'KYC Submitted', 'Your KYC documents have been submitted for verification', 'kyc')
    `

    return NextResponse.json({
      success: true,
      message: "KYC documents submitted successfully. Verification typically takes 1-2 business days.",
    })
  } catch (error) {
    console.error("KYC submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
