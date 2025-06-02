import { pool } from "./database"

interface FraudCheckData {
  userId: string
  action: string
  ipAddress: string
  userAgent: string
  amount?: number
  frequency?: number
}

export class FraudDetectionSystem {
  private static instance: FraudDetectionSystem
  private riskThresholds = {
    HIGH_RISK: 80,
    MEDIUM_RISK: 50,
    LOW_RISK: 20,
  }

  static getInstance(): FraudDetectionSystem {
    if (!FraudDetectionSystem.instance) {
      FraudDetectionSystem.instance = new FraudDetectionSystem()
    }
    return FraudDetectionSystem.instance
  }

  async checkFraudRisk(data: FraudCheckData): Promise<{
    riskScore: number
    riskLevel: string
    factors: string[]
    blocked: boolean
  }> {
    const client = await pool.connect()

    try {
      let riskScore = 0
      const factors: string[] = []

      // Check 1: Multiple failed login attempts
      if (data.action === "login") {
        const failedAttempts = await this.getFailedLoginAttempts(data.userId, data.ipAddress)
        if (failedAttempts > 5) {
          riskScore += 30
          factors.push("Multiple failed login attempts")
        }
      }

      // Check 2: Unusual IP address
      const isNewIP = await this.checkUnusualIP(data.userId, data.ipAddress)
      if (isNewIP) {
        riskScore += 20
        factors.push("Login from new IP address")
      }

      // Check 3: High frequency trading
      if (data.action === "create_trade" && data.frequency) {
        if (data.frequency > 10) {
          riskScore += 25
          factors.push("High frequency trading activity")
        }
      }

      // Check 4: Large amount transactions
      if (data.amount && data.amount > 1000000) {
        // > 1M Naira
        riskScore += 15
        factors.push("Large transaction amount")
      }

      // Check 5: Device fingerprinting
      const suspiciousDevice = await this.checkDeviceFingerprint(data.userAgent, data.ipAddress)
      if (suspiciousDevice) {
        riskScore += 35
        factors.push("Suspicious device characteristics")
      }

      // Check 6: Velocity checks
      const velocityRisk = await this.checkVelocity(data.userId, data.action)
      riskScore += velocityRisk.score
      if (velocityRisk.factors.length > 0) {
        factors.push(...velocityRisk.factors)
      }

      // Determine risk level
      let riskLevel = "LOW"
      let blocked = false

      if (riskScore >= this.riskThresholds.HIGH_RISK) {
        riskLevel = "HIGH"
        blocked = true
      } else if (riskScore >= this.riskThresholds.MEDIUM_RISK) {
        riskLevel = "MEDIUM"
      }

      // Log fraud check
      await client.query(
        `INSERT INTO fraud_logs (user_id, action, risk_score, factors, ip_address, user_agent, blocked)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [data.userId, data.action, riskScore, JSON.stringify(factors), data.ipAddress, data.userAgent, blocked],
      )

      return {
        riskScore,
        riskLevel,
        factors,
        blocked,
      }
    } finally {
      client.release()
    }
  }

  private async getFailedLoginAttempts(userId: string, ipAddress: string): Promise<number> {
    const client = await pool.connect()

    try {
      const result = await client.query(
        `SELECT COUNT(*) as count FROM fraud_logs 
         WHERE (user_id = $1 OR ip_address = $2) 
         AND action = 'failed_login' 
         AND created_at > NOW() - INTERVAL '1 hour'`,
        [userId, ipAddress],
      )

      return Number.parseInt(result.rows[0].count)
    } finally {
      client.release()
    }
  }

  private async checkUnusualIP(userId: string, ipAddress: string): Promise<boolean> {
    const client = await pool.connect()

    try {
      const result = await client.query(
        `SELECT COUNT(*) as count FROM fraud_logs 
         WHERE user_id = $1 AND ip_address = $2 
         AND created_at > NOW() - INTERVAL '30 days'`,
        [userId, ipAddress],
      )

      return Number.parseInt(result.rows[0].count) === 0
    } finally {
      client.release()
    }
  }

  private async checkDeviceFingerprint(userAgent: string, ipAddress: string): Promise<boolean> {
    // Simple device fingerprinting - in production, use more sophisticated methods
    const suspiciousPatterns = [/bot/i, /crawler/i, /spider/i, /automated/i]

    return suspiciousPatterns.some((pattern) => pattern.test(userAgent))
  }

  private async checkVelocity(
    userId: string,
    action: string,
  ): Promise<{
    score: number
    factors: string[]
  }> {
    const client = await pool.connect()

    try {
      let score = 0
      const factors: string[] = []

      // Check actions in last hour
      const hourlyResult = await client.query(
        `SELECT COUNT(*) as count FROM fraud_logs 
         WHERE user_id = $1 AND action = $2 
         AND created_at > NOW() - INTERVAL '1 hour'`,
        [userId, action],
      )

      const hourlyCount = Number.parseInt(hourlyResult.rows[0].count)
      if (hourlyCount > 20) {
        score += 40
        factors.push("High velocity - too many actions per hour")
      } else if (hourlyCount > 10) {
        score += 20
        factors.push("Medium velocity - elevated activity")
      }

      // Check actions in last day
      const dailyResult = await client.query(
        `SELECT COUNT(*) as count FROM fraud_logs 
         WHERE user_id = $1 AND action = $2 
         AND created_at > NOW() - INTERVAL '24 hours'`,
        [userId, action],
      )

      const dailyCount = Number.parseInt(dailyResult.rows[0].count)
      if (dailyCount > 100) {
        score += 30
        factors.push("Very high daily activity")
      }

      return { score, factors }
    } finally {
      client.release()
    }
  }

  async blockUser(userId: string, reason: string): Promise<void> {
    const client = await pool.connect()

    try {
      await client.query("UPDATE users SET is_active = false WHERE id = $1", [userId])

      await client.query(
        `INSERT INTO fraud_logs (user_id, action, risk_score, factors, blocked)
         VALUES ($1, 'user_blocked', 100, $2, true)`,
        [userId, JSON.stringify([reason])],
      )
    } finally {
      client.release()
    }
  }
}
