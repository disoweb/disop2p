import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { WalletManager } from "@/lib/wallet-manager"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    const body = await request.json()
    const { currency, amount, address } = body

    if (!currency || !amount || !address) {
      return NextResponse.json({ error: "Currency, amount, and address are required" }, { status: 400 })
    }

    const walletManager = WalletManager.getInstance()
    const result = await walletManager.initiateWithdrawal(userId, currency, amount, address)

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          reference: result.reference,
        },
        message: result.message,
      })
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
  } catch (error) {
    console.error("Withdrawal initiation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
