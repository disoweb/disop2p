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

    const body = await request.json()
    const { bvn, firstName, lastName } = body

    if (!bvn || !firstName || !lastName) {
      return NextResponse.json({ error: "BVN, first name, and last name are required" }, { status: 400 })
    }

    const kycManager = KYCComplianceManager.getInstance()
    const result = await kycManager.verifyBVN(bvn, firstName, lastName)

    if (result.valid) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: result.data,
      })
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
  } catch (error) {
    console.error("BVN verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
