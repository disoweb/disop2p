import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { EscrowManager } from "@/lib/escrow"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    const body = await request.json()
    const { tradeId, reason, description, evidenceUrls } = body

    if (!tradeId || !reason || !description) {
      return NextResponse.json({ error: "Trade ID, reason, and description are required" }, { status: 400 })
    }

    const escrowManager = EscrowManager.getInstance()
    const result = await escrowManager.initiateDispute(tradeId, userId, reason, description)

    if (result.success) {
      return NextResponse.json({
        success: true,
        disputeId: result.disputeId,
        message: result.message,
      })
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
  } catch (error) {
    console.error("Dispute creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
