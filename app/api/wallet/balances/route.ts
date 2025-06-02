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

    const walletManager = WalletManager.getInstance()

    // Create wallets if they don't exist
    await walletManager.createUserWallets(userId)

    // Get wallet balances
    const balances = await walletManager.getUserWallets(userId)

    return NextResponse.json({
      success: true,
      data: balances,
    })
  } catch (error) {
    console.error("Error fetching wallet balances:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
