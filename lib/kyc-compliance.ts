import { pool } from "./database"

export interface KYCDocument {
  type: "nin" | "bvn" | "passport" | "drivers_license" | "voters_card" | "utility_bill" | "bank_statement"
  number?: string
  imageUrl: string
  expiryDate?: string
}

export class KYCComplianceManager {
  private static instance: KYCComplianceManager
  private nigerianStates = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "FCT",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
  ]

  static getInstance(): KYCComplianceManager {
    if (!KYCComplianceManager.instance) {
      KYCComplianceManager.instance = new KYCComplianceManager()
    }
    return KYCComplianceManager.instance
  }

  async submitKYCDocument(
    userId: string,
    document: KYCDocument,
  ): Promise<{
    success: boolean
    documentId?: string
    message: string
  }> {
    const client = await pool.connect()

    try {
      // Validate document
      const validation = await this.validateDocument(document)
      if (!validation.valid) {
        return {
          success: false,
          message: validation.message,
        }
      }

      // Check if document already exists
      const existingDoc = await client.query("SELECT id FROM kyc_documents WHERE user_id = $1 AND document_type = $2", [
        userId,
        document.type,
      ])

      let documentId: string

      if (existingDoc.rows.length > 0) {
        // Update existing document
        const result = await client.query(
          `UPDATE kyc_documents 
           SET document_number = $1, document_url = $2, verification_status = 'pending', created_at = CURRENT_TIMESTAMP
           WHERE user_id = $3 AND document_type = $4 RETURNING id`,
          [document.number, document.imageUrl, userId, document.type],
        )
        documentId = result.rows[0].id
      } else {
        // Insert new document
        const result = await client.query(
          `INSERT INTO kyc_documents (user_id, document_type, document_number, document_url)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [userId, document.type, document.number, document.imageUrl],
        )
        documentId = result.rows[0].id
      }

      // Update user KYC status
      await this.updateUserKYCStatus(userId)

      return {
        success: true,
        documentId,
        message: "Document submitted successfully for verification",
      }
    } catch (error) {
      console.error("KYC submission error:", error)
      return {
        success: false,
        message: "Failed to submit document",
      }
    } finally {
      client.release()
    }
  }

  async verifyBVN(
    bvn: string,
    firstName: string,
    lastName: string,
  ): Promise<{
    valid: boolean
    message: string
    data?: any
  }> {
    try {
      // In production, integrate with actual BVN verification service
      // For now, simulate verification

      if (bvn.length !== 11 || !/^\d+$/.test(bvn)) {
        return {
          valid: false,
          message: "Invalid BVN format",
        }
      }

      // Simulate API call to BVN verification service
      const mockBVNData = {
        bvn,
        firstName: firstName.toUpperCase(),
        lastName: lastName.toUpperCase(),
        dateOfBirth: "1990-01-01",
        phoneNumber: "08012345678",
        verified: true,
      }

      return {
        valid: true,
        message: "BVN verified successfully",
        data: mockBVNData,
      }
    } catch (error) {
      return {
        valid: false,
        message: "BVN verification failed",
      }
    }
  }

  async verifyNIN(nin: string): Promise<{
    valid: boolean
    message: string
    data?: any
  }> {
    try {
      if (nin.length !== 11 || !/^\d+$/.test(nin)) {
        return {
          valid: false,
          message: "Invalid NIN format",
        }
      }

      // Simulate NIN verification
      const mockNINData = {
        nin,
        firstName: "JOHN",
        lastName: "DOE",
        middleName: "ADEBAYO",
        dateOfBirth: "1990-01-01",
        gender: "M",
        verified: true,
      }

      return {
        valid: true,
        message: "NIN verified successfully",
        data: mockNINData,
      }
    } catch (error) {
      return {
        valid: false,
        message: "NIN verification failed",
      }
    }
  }

  async checkAMLCompliance(
    userId: string,
    transactionAmount: number,
  ): Promise<{
    compliant: boolean
    riskLevel: "LOW" | "MEDIUM" | "HIGH"
    message: string
    requiresReporting: boolean
  }> {
    const client = await pool.connect()

    try {
      // Get user's transaction history
      const result = await client.query(
        `SELECT SUM(total_amount) as total_volume, COUNT(*) as transaction_count
         FROM trades 
         WHERE (buyer_id = $1 OR seller_id = $1) 
         AND status = 'completed'
         AND created_at > NOW() - INTERVAL '30 days'`,
        [userId],
      )

      const { total_volume = 0, transaction_count = 0 } = result.rows[0]
      const monthlyVolume = Number.parseFloat(total_volume) + transactionAmount

      // Nigerian AML thresholds (simplified)
      const DAILY_THRESHOLD = 5000000 // 5M Naira
      const MONTHLY_THRESHOLD = 50000000 // 50M Naira
      const SINGLE_TRANSACTION_THRESHOLD = 10000000 // 10M Naira

      let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW"
      let requiresReporting = false
      let compliant = true

      if (transactionAmount > SINGLE_TRANSACTION_THRESHOLD) {
        riskLevel = "HIGH"
        requiresReporting = true
      } else if (monthlyVolume > MONTHLY_THRESHOLD) {
        riskLevel = "HIGH"
        requiresReporting = true
      } else if (transactionAmount > DAILY_THRESHOLD) {
        riskLevel = "MEDIUM"
      }

      // Check if user is properly verified for high-risk transactions
      if (riskLevel === "HIGH") {
        const userResult = await client.query("SELECT kyc_level, is_verified FROM users WHERE id = $1", [userId])

        const user = userResult.rows[0]
        if (!user.is_verified || user.kyc_level < 2) {
          compliant = false
        }
      }

      return {
        compliant,
        riskLevel,
        message: compliant ? "Transaction compliant with AML requirements" : "Additional verification required",
        requiresReporting,
      }
    } finally {
      client.release()
    }
  }

  private async validateDocument(document: KYCDocument): Promise<{
    valid: boolean
    message: string
  }> {
    // Basic validation
    if (!document.imageUrl) {
      return {
        valid: false,
        message: "Document image is required",
      }
    }

    // Type-specific validation
    switch (document.type) {
      case "bvn":
        if (!document.number || document.number.length !== 11) {
          return {
            valid: false,
            message: "BVN must be 11 digits",
          }
        }
        break

      case "nin":
        if (!document.number || document.number.length !== 11) {
          return {
            valid: false,
            message: "NIN must be 11 digits",
          }
        }
        break

      case "passport":
        if (!document.number || document.number.length < 8) {
          return {
            valid: false,
            message: "Invalid passport number",
          }
        }
        break
    }

    return {
      valid: true,
      message: "Document validation passed",
    }
  }

  private async updateUserKYCStatus(userId: string): Promise<void> {
    const client = await pool.connect()

    try {
      // Count verified documents
      const result = await client.query(
        `SELECT COUNT(*) as verified_count FROM kyc_documents 
         WHERE user_id = $1 AND verification_status = 'verified'`,
        [userId],
      )

      const verifiedCount = Number.parseInt(result.rows[0].verified_count)
      let kycLevel = 0
      let isVerified = false

      if (verifiedCount >= 1) {
        kycLevel = 1 // Basic verification
      }
      if (verifiedCount >= 2) {
        kycLevel = 2 // Enhanced verification
        isVerified = true
      }
      if (verifiedCount >= 3) {
        kycLevel = 3 // Full verification
      }

      await client.query("UPDATE users SET kyc_level = $1, is_verified = $2 WHERE id = $3", [
        kycLevel,
        isVerified,
        userId,
      ])
    } finally {
      client.release()
    }
  }
}
