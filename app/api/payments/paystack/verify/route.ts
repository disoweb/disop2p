import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { PaymentGatewayManager } from "@/lib/payment-gateway"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    const body = await request.json()
    const { reference } = body

    if (!reference) {
      return NextResponse.json({ error: "Payment reference is required" }, { status: 400 })
    }

    const paymentManager = PaymentGatewayManager.getInstance()
    const result = await paymentManager.verifyPaystackPayment(reference, userId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: result.message,
      })
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
