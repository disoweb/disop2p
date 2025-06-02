import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { KYCComplianceManager } from "@/lib/kyc-compliance"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    const body = await request.json()
    const { documentType, documentNumber, imageUrl, expiryDate } = body

    if (!documentType || !imageUrl) {
      return NextResponse.json({ error: "Document type and image are required" }, { status: 400 })
    }

    const kycManager = KYCComplianceManager.getInstance()
    const result = await kycManager.submitKYCDocument(userId, {
      type: documentType,
      number: documentNumber,
      imageUrl,
      expiryDate,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        documentId: result.documentId,
        message: result.message,
      })
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
  } catch (error) {
    console.error("KYC submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
