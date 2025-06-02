import { pool } from "./database"
import crypto from "crypto"

export class EscrowManager {
  private static instance: EscrowManager
  private escrowWallets: Map<string, any> = new Map()

  static getInstance(): EscrowManager {
    if (!EscrowManager.instance) {
      EscrowManager.instance = new EscrowManager()
    }
    return EscrowManager.instance
  }

  async createEscrow(tradeId: string, sellerId: string, amount: number, cryptocurrency: string) {
    const client = await pool.connect()

    try {
      // Generate unique escrow address
      const escrowAddress = this.generateEscrowAddress(tradeId)

      // Create escrow record
      await client.query("UPDATE trades SET escrow_address = $1, escrow_amount = $2, status = $3 WHERE id = $4", [
        escrowAddress,
        amount,
        "escrow_pending",
        tradeId,
      ])

      // Simulate blockchain transaction (in production, integrate with actual blockchain)
      const escrowData = {
        tradeId,
        sellerId,
        amount,
        cryptocurrency,
        address: escrowAddress,
        status: "pending",
        createdAt: new Date(),
        releaseConditions: {
          buyerConfirmation: false,
          sellerConfirmation: false,
          timeoutHours: 24,
        },
      }

      this.escrowWallets.set(escrowAddress, escrowData)

      return {
        success: true,
        escrowAddress,
        message: "Escrow created successfully",
      }
    } catch (error) {
      console.error("Escrow creation error:", error)
      throw new Error("Failed to create escrow")
    } finally {
      client.release()
    }
  }

  async releaseEscrow(tradeId: string, userId: string, userType: "buyer" | "seller") {
    const client = await pool.connect()

    try {
      // Get trade details
      const tradeResult = await client.query("SELECT * FROM trades WHERE id = $1", [tradeId])
      if (tradeResult.rows.length === 0) {
        throw new Error("Trade not found")
      }

      const trade = tradeResult.rows[0]
      const escrowData = this.escrowWallets.get(trade.escrow_address)

      if (!escrowData) {
        throw new Error("Escrow not found")
      }

      // Update release conditions
      if (userType === "buyer") {
        escrowData.releaseConditions.buyerConfirmation = true
      } else {
        escrowData.releaseConditions.sellerConfirmation = true
      }

      // Check if both parties have confirmed
      const canRelease =
        escrowData.releaseConditions.buyerConfirmation && escrowData.releaseConditions.sellerConfirmation

      if (canRelease) {
        // Release funds to seller
        await this.executeFundsRelease(trade, escrowData)

        // Update trade status
        await client.query("UPDATE trades SET status = $1, completed_at = CURRENT_TIMESTAMP WHERE id = $2", [
          "completed",
          tradeId,
        ])

        // Update user statistics
        await this.updateUserStats(trade.buyer_id, trade.seller_id, trade.total_amount)

        return {
          success: true,
          message: "Funds released successfully",
          status: "completed",
        }
      } else {
        return {
          success: true,
          message: "Confirmation recorded, waiting for other party",
          status: "pending_release",
        }
      }
    } catch (error) {
      console.error("Escrow release error:", error)
      throw new Error("Failed to release escrow")
    } finally {
      client.release()
    }
  }

  async initiateDispute(tradeId: string, complainantId: string, reason: string, description: string) {
    const client = await pool.connect()

    try {
      // Get trade details
      const tradeResult = await client.query("SELECT * FROM trades WHERE id = $1", [tradeId])
      if (tradeResult.rows.length === 0) {
        throw new Error("Trade not found")
      }

      const trade = tradeResult.rows[0]
      const respondentId = trade.buyer_id === complainantId ? trade.seller_id : trade.buyer_id

      // Create dispute record
      const disputeResult = await client.query(
        `INSERT INTO disputes (trade_id, complainant_id, respondent_id, reason, description)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [tradeId, complainantId, respondentId, reason, description],
      )

      // Update trade status
      await client.query("UPDATE trades SET status = $1, dispute_reason = $2 WHERE id = $3", [
        "disputed",
        reason,
        tradeId,
      ])

      // Freeze escrow
      const escrowData = this.escrowWallets.get(trade.escrow_address)
      if (escrowData) {
        escrowData.status = "frozen"
        escrowData.disputeId = disputeResult.rows[0].id
      }

      return {
        success: true,
        disputeId: disputeResult.rows[0].id,
        message: "Dispute initiated successfully",
      }
    } catch (error) {
      console.error("Dispute initiation error:", error)
      throw new Error("Failed to initiate dispute")
    } finally {
      client.release()
    }
  }

  private generateEscrowAddress(tradeId: string): string {
    const hash = crypto
      .createHash("sha256")
      .update(tradeId + Date.now())
      .digest("hex")
    return `escrow_${hash.substring(0, 16)}`
  }

  private async executeFundsRelease(trade: any, escrowData: any) {
    // In production, this would interact with actual blockchain/payment systems
    console.log(`Releasing ${escrowData.amount} ${escrowData.cryptocurrency} to seller ${trade.seller_id}`)

    // Update escrow status
    escrowData.status = "released"
    escrowData.releasedAt = new Date()
  }

  private async updateUserStats(buyerId: string, sellerId: string, amount: number) {
    const client = await pool.connect()

    try {
      // Update buyer stats
      await client.query(
        `UPDATE users SET 
         total_trades = total_trades + 1,
         successful_trades = successful_trades + 1,
         total_volume = total_volume + $1
         WHERE id = $2`,
        [amount, buyerId],
      )

      // Update seller stats
      await client.query(
        `UPDATE users SET 
         total_trades = total_trades + 1,
         successful_trades = successful_trades + 1,
         total_volume = total_volume + $1
         WHERE id = $2`,
        [amount, sellerId],
      )

      // Recalculate ratings
      await this.updateUserRatings(buyerId)
      await this.updateUserRatings(sellerId)
    } finally {
      client.release()
    }
  }

  private async updateUserRatings(userId: string) {
    const client = await pool.connect()

    try {
      const result = await client.query("SELECT successful_trades, total_trades FROM users WHERE id = $1", [userId])

      if (result.rows.length > 0) {
        const { successful_trades, total_trades } = result.rows[0]
        const rating = total_trades > 0 ? (successful_trades / total_trades) * 5 : 0

        await client.query("UPDATE users SET rating = $1 WHERE id = $2", [rating.toFixed(2), userId])
      }
    } finally {
      client.release()
    }
  }
}
