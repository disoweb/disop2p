import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { WalletManager } from "@/lib/wallet-manager"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const walletManager = WalletManager.getInstance()
    const transactions = await walletManager.getWalletTransactions(userId, limit, offset)

    return NextResponse.json({
      success: true,
      data: transactions,
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
