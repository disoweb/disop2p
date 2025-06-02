import { neon } from "@neondatabase/serverless"
import crypto from "crypto"

const sql = neon(process.env.DATABASE_URL!)

export interface WalletBalance {
  currency: string
  balance: string
  availableBalance: string
  lockedBalance: string
  nairaValue: string
  address: string
}

export interface WalletTransaction {
  id: string
  type: string
  amount: string
  fee: string
  currency: string
  status: string
  reference?: string
  description?: string
  blockchainTxid?: string
  createdAt: string
}

export class WalletManager {
  private static instance: WalletManager

  static getInstance(): WalletManager {
    if (!WalletManager.instance) {
      WalletManager.instance = new WalletManager()
    }
    return WalletManager.instance
  }

  async createUserWallets(userId: string): Promise<void> {
    const currencies = ["USDT", "BNB", "SOL", "TON", "BTC", "ETH"]

    for (const currency of currencies) {
      const address = this.generateWalletAddress(currency)
      const privateKey = this.generatePrivateKey()

      await sql`
        INSERT INTO wallets (user_id, currency, address, private_key, balance, available_balance, locked_balance)
        VALUES (${userId}, ${currency}, ${address}, ${privateKey}, 0, 0, 0)
        ON CONFLICT (user_id, currency) DO NOTHING
      `
    }
  }

  async getUserWallets(userId: string): Promise<WalletBalance[]> {
    const wallets = await sql`
      SELECT w.*, cr.rate
      FROM wallets w
      LEFT JOIN currency_rates cr ON w.currency = cr.base_currency AND cr.quote_currency = 'NGN'
      WHERE w.user_id = ${userId}
      ORDER BY w.currency
    `

    return wallets.map((wallet) => ({
      currency: wallet.currency,
      balance: wallet.balance.toString(),
      availableBalance: wallet.available_balance.toString(),
      lockedBalance: wallet.locked_balance.toString(),
      nairaValue: (Number.parseFloat(wallet.balance) * (wallet.rate || 0)).toFixed(2),
      address: wallet.address,
    }))
  }

  async getWalletTransactions(userId: string, limit = 20, offset = 0): Promise<WalletTransaction[]> {
    const transactions = await sql`
      SELECT * FROM wallet_transactions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    return transactions.map((tx) => ({
      id: tx.id,
      type: tx.transaction_type,
      amount: tx.amount.toString(),
      fee: tx.fee.toString(),
      currency: tx.currency,
      status: tx.status,
      reference: tx.reference,
      description: tx.description,
      blockchainTxid: tx.blockchain_txid,
      createdAt: tx.created_at,
    }))
  }

  async initiateDeposit(
    userId: string,
    currency: string,
    amount: string,
  ): Promise<{
    success: boolean
    address?: string
    reference?: string
    message: string
  }> {
    try {
      const wallet = await sql`
        SELECT * FROM wallets WHERE user_id = ${userId} AND currency = ${currency}
      `

      if (wallet.length === 0) {
        return { success: false, message: "Wallet not found" }
      }

      const reference = `DEP_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`

      await sql`
        INSERT INTO wallet_transactions (wallet_id, user_id, transaction_type, amount, currency, status, reference, description)
        VALUES (${wallet[0].id}, ${userId}, 'deposit', ${amount}, ${currency}, 'pending', ${reference}, 'Crypto deposit')
      `

      return {
        success: true,
        address: wallet[0].address,
        reference,
        message: `Send ${amount} ${currency} to the provided address`,
      }
    } catch (error) {
      console.error("Deposit initiation error:", error)
      return { success: false, message: "Failed to initiate deposit" }
    }
  }

  async initiateWithdrawal(
    userId: string,
    currency: string,
    amount: string,
    address: string,
  ): Promise<{
    success: boolean
    reference?: string
    message: string
  }> {
    try {
      const wallet = await sql`
        SELECT * FROM wallets WHERE user_id = ${userId} AND currency = ${currency}
      `

      if (wallet.length === 0) {
        return { success: false, message: "Wallet not found" }
      }

      if (Number.parseFloat(wallet[0].available_balance) < Number.parseFloat(amount)) {
        return { success: false, message: "Insufficient balance" }
      }

      const reference = `WTH_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`
      const fee = this.calculateWithdrawalFee(currency, amount)

      // Lock the funds
      await sql`
        UPDATE wallets 
        SET available_balance = available_balance - ${amount},
            locked_balance = locked_balance + ${amount}
        WHERE user_id = ${userId} AND currency = ${currency}
      `

      await sql`
        INSERT INTO wallet_transactions (wallet_id, user_id, transaction_type, amount, fee, currency, status, reference, description, metadata)
        VALUES (${wallet[0].id}, ${userId}, 'withdrawal', ${amount}, ${fee}, ${currency}, 'pending', ${reference}, 'Crypto withdrawal', ${JSON.stringify({ address })})
      `

      return {
        success: true,
        reference,
        message: "Withdrawal initiated successfully",
      }
    } catch (error) {
      console.error("Withdrawal initiation error:", error)
      return { success: false, message: "Failed to initiate withdrawal" }
    }
  }

  async processDeposit(reference: string, blockchainTxid: string): Promise<boolean> {
    try {
      const transaction = await sql`
        SELECT wt.*, w.user_id FROM wallet_transactions wt
        JOIN wallets w ON wt.wallet_id = w.id
        WHERE wt.reference = ${reference} AND wt.status = 'pending'
      `

      if (transaction.length === 0) {
        return false
      }

      const tx = transaction[0]

      // Update wallet balance
      await sql`
        UPDATE wallets 
        SET balance = balance + ${tx.amount},
            available_balance = available_balance + ${tx.amount}
        WHERE id = ${tx.wallet_id}
      `

      // Update transaction status
      await sql`
        UPDATE wallet_transactions 
        SET status = 'completed', blockchain_txid = ${blockchainTxid}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${tx.id}
      `

      // Send notification
      await this.sendNotification(tx.user_id, {
        title: "Deposit Confirmed",
        message: `Your deposit of ${tx.amount} ${tx.currency} has been confirmed`,
        type: "wallet",
      })

      return true
    } catch (error) {
      console.error("Deposit processing error:", error)
      return false
    }
  }

  private generateWalletAddress(currency: string): string {
    // In production, use proper wallet generation libraries
    const prefix = currency === "BTC" ? "1" : "0x"
    return prefix + crypto.randomBytes(20).toString("hex")
  }

  private generatePrivateKey(): string {
    return crypto.randomBytes(32).toString("hex")
  }

  private calculateWithdrawalFee(currency: string, amount: string): string {
    const fees: Record<string, number> = {
      USDT: 5,
      BNB: 0.001,
      SOL: 0.01,
      TON: 0.1,
      BTC: 0.0005,
      ETH: 0.005,
    }
    return (fees[currency] || 0).toString()
  }

  private async sendNotification(userId: string, notification: any): Promise<void> {
    await sql`
      INSERT INTO notifications (user_id, title, message, type, data)
      VALUES (${userId}, ${notification.title}, ${notification.message}, ${notification.type}, ${JSON.stringify(notification.data || {})})
    `
  }
}
