import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { pool } from "@/lib/database"
import { FraudDetectionSystem } from "@/lib/fraud-detection"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      // Get user
      const result = await client.query(
        "SELECT id, email, password_hash, first_name, last_name, is_active, is_verified FROM users WHERE email = $1",
        [email],
      )

      if (result.rows.length === 0) {
        // Log failed login attempt
        const fraudSystem = FraudDetectionSystem.getInstance()
        await fraudSystem.checkFraudRisk({
          userId: email,
          action: "failed_login",
          ipAddress: request.ip || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        })

        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      const user = result.rows[0]

      // Check if user is active
      if (!user.is_active) {
        return NextResponse.json({ error: "Account has been suspended" }, { status: 403 })
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash)

      if (!isValidPassword) {
        // Log failed login attempt
        const fraudSystem = FraudDetectionSystem.getInstance()
        await fraudSystem.checkFraudRisk({
          userId: user.id,
          action: "failed_login",
          ipAddress: request.ip || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        })

        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      // Fraud detection check for successful login
      const fraudSystem = FraudDetectionSystem.getInstance()
      const fraudCheck = await fraudSystem.checkFraudRisk({
        userId: user.id,
        action: "login",
        ipAddress: request.ip || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      })

      if (fraudCheck.blocked) {
        return NextResponse.json(
          { error: "Login blocked due to security concerns. Please contact support." },
          { status: 403 },
        )
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: "7d" })

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          isVerified: user.is_verified,
        },
        token,
        securityAlert: fraudCheck.riskLevel === "MEDIUM" ? "Login from new location detected" : null,
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
