import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { pool } from "@/lib/database"
import { FraudDetectionSystem } from "@/lib/fraud-detection"
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
    const { type, cryptocurrency, amount, rate, minLimit, maxLimit, paymentMethod, timeLimit, instructions } = body

    // Input validation
    if (!type || !cryptocurrency || !amount || !rate || !minLimit || !maxLimit || !paymentMethod) {
      return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 })
    }

    // Fraud detection
    const fraudSystem = FraudDetectionSystem.getInstance()
    const fraudCheck = await fraudSystem.checkFraudRisk({
      userId,
      action: "create_trade",
      ipAddress: request.ip || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      amount: Number.parseFloat(maxLimit),
    })

    if (fraudCheck.blocked) {
      return NextResponse.json({ error: "Trade creation blocked due to security concerns" }, { status: 403 })
    }

    // AML compliance check
    const kycManager = KYCComplianceManager.getInstance()
    const amlCheck = await kycManager.checkAMLCompliance(userId, Number.parseFloat(maxLimit))

    if (!amlCheck.compliant) {
      return NextResponse.json(
        { error: "Additional verification required for this transaction amount" },
        { status: 403 },
      )
    }

    const client = await pool.connect()

    try {
      // Create order
      const result = await client.query(
        `INSERT INTO orders (user_id, type, cryptocurrency, amount, rate, min_limit, max_limit, payment_method, payment_time_limit, instructions)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [userId, type, cryptocurrency, amount, rate, minLimit, maxLimit, paymentMethod, timeLimit || 15, instructions],
      )

      const order = result.rows[0]

      return NextResponse.json({
        success: true,
        order: {
          id: order.id,
          type: order.type,
          cryptocurrency: order.cryptocurrency,
          amount: order.amount,
          rate: order.rate,
          minLimit: order.min_limit,
          maxLimit: order.max_limit,
          paymentMethod: order.payment_method,
          status: order.status,
        },
        message: "Order created successfully",
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Trade creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
