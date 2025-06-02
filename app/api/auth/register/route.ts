import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { pool } from "@/lib/database"
import { FraudDetectionSystem } from "@/lib/fraud-detection"
import { KYCComplianceManager } from "@/lib/kyc-compliance"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, password, state, city, bvn } = body

    // Input validation
    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Fraud detection check
    const fraudSystem = FraudDetectionSystem.getInstance()
    const fraudCheck = await fraudSystem.checkFraudRisk({
      userId: email, // Use email as temp ID for registration
      action: "register",
      ipAddress: request.ip || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    })

    if (fraudCheck.blocked) {
      return NextResponse.json({ error: "Registration blocked due to security concerns" }, { status: 403 })
    }

    const client = await pool.connect()

    try {
      // Check if user already exists
      const existingUser = await client.query("SELECT id FROM users WHERE email = $1 OR phone = $2", [email, phone])

      if (existingUser.rows.length > 0) {
        return NextResponse.json({ error: "User with this email or phone already exists" }, { status: 409 })
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12)

      // Create user
      const result = await client.query(
        `INSERT INTO users (first_name, last_name, email, phone, password_hash, state, city, bvn)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, first_name, last_name`,
        [firstName, lastName, email, phone, passwordHash, state, city, bvn],
      )

      const user = result.rows[0]

      // Verify BVN if provided
      if (bvn) {
        const kycManager = KYCComplianceManager.getInstance()
        const bvnVerification = await kycManager.verifyBVN(bvn, firstName, lastName)

        if (bvnVerification.valid) {
          await kycManager.submitKYCDocument(user.id, {
            type: "bvn",
            number: bvn,
            imageUrl: "verified",
          })
        }
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
        },
        token,
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
