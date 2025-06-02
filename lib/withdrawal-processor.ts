import { neon } from "@neondatabase/serverless"
import crypto from "crypto"

const sql = neon(process.env.DATABASE_URL!)

export class WithdrawalProcessor {
  private static instance: WithdrawalProcessor

  static getInstance(): WithdrawalProcessor {
    if (!WithdrawalProcessor.instance) {
      WithdrawalProcessor.instance = new WithdrawalProcessor()
    }
    return WithdrawalProcessor.instance
  }

  async processPendingWithdrawals(): Promise<void> {
    try {
      const pendingWithdrawals = await sql`
        SELECT wt.*, w.currency, w.user_id
        FROM wallet_transactions wt
        JOIN wallets w ON wt.wallet_id = w.id
        WHERE wt.transaction_type = 'withdrawal' 
        AND wt.status = 'pending'
        AND wt.created_at < NOW() - INTERVAL '5 minutes'
        ORDER BY wt.created_at ASC
        LIMIT 10
      `

      for (const withdrawal of pendingWithdrawals) {
        await this.processWithdrawal(withdrawal)
      }
    } catch (error) {
      console.error("Error processing withdrawals:", error)
    }
  }

  private async processWithdrawal(withdrawal: any): Promise<void> {
    try {
      // Simulate blockchain transaction
      const success = await this.simulateBlockchainTransaction(withdrawal)

      if (success) {
        const blockchainTxid = this.generateTransactionHash()

        // Update wallet balance
        await sql`
          UPDATE wallets 
          SET locked_balance = locked_balance - ${withdrawal.amount},
              balance = balance - ${withdrawal.amount}
          WHERE id = ${withdrawal.wallet_id}
        `

        // Update transaction status
        await sql`
          UPDATE wallet_transactions 
          SET status = 'completed', 
              blockchain_txid = ${blockchainTxid},
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${withdrawal.id}
        `

        // Send notification
        await this.sendNotification(withdrawal.user_id, {
          title: "Withdrawal Completed",
          message: `Your withdrawal of ${withdrawal.amount} ${withdrawal.currency} has been completed`,
          type: "wallet",
          data: { transactionId: withdrawal.id, blockchainTxid },
        })

        console.log(`Withdrawal ${withdrawal.id} completed successfully`)
      } else {
        // Mark as failed and unlock funds
        await sql`
          UPDATE wallets 
          SET locked_balance = locked_balance - ${withdrawal.amount},
              available_balance = available_balance + ${withdrawal.amount}
          WHERE id = ${withdrawal.wallet_id}
        `

        await sql`
          UPDATE wallet_transactions 
          SET status = 'failed', updated_at = CURRENT_TIMESTAMP
          WHERE id = ${withdrawal.id}
        `

        // Send notification
        await this.sendNotification(withdrawal.user_id, {
          title: "Withdrawal Failed",
          message: `Your withdrawal of ${withdrawal.amount} ${withdrawal.currency} has failed. Funds have been returned to your wallet.`,
          type: "wallet",
          data: { transactionId: withdrawal.id },
        })

        console.log(`Withdrawal ${withdrawal.id} failed`)
      }
    } catch (error) {
      console.error(`Error processing withdrawal ${withdrawal.id}:`, error)
    }
  }

  private async simulateBlockchainTransaction(withdrawal: any): Promise<boolean> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate 95% success rate
    return Math.random() > 0.05
  }

  private generateTransactionHash(): string {
    return "0x" + crypto.randomBytes(32).toString("hex")
  }

  private async sendNotification(userId: string, notification: any): Promise<void> {
    await sql`
      INSERT INTO notifications (user_id, title, message, type, data)
      VALUES (${userId}, ${notification.title}, ${notification.message}, ${notification.type}, ${JSON.stringify(notification.data || {})})
    `
  }

  async startProcessing(): Promise<void> {
    console.log("Starting withdrawal processor...")

    // Process withdrawals every 30 seconds
    setInterval(async () => {
      await this.processPendingWithdrawals()
    }, 30000)
  }
}
