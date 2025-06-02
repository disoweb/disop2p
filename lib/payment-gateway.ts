interface PaymentRequest {
  amount: number
  currency: string
  email: string
  reference: string
  callback_url?: string
}

interface BankAccount {
  account_number: string
  bank_code: string
  account_name: string
}

export class PaymentGatewayManager {
  private static instance: PaymentGatewayManager
  private paystackSecretKey = process.env.PAYSTACK_SECRET_KEY!
  private flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY!

  static getInstance(): PaymentGatewayManager {
    if (!PaymentGatewayManager.instance) {
      PaymentGatewayManager.instance = new PaymentGatewayManager()
    }
    return PaymentGatewayManager.instance
  }

  async initializePayment(
    gateway: "paystack" | "flutterwave",
    request: PaymentRequest,
  ): Promise<{
    success: boolean
    authorization_url?: string
    access_code?: string
    reference: string
    message: string
  }> {
    try {
      switch (gateway) {
        case "paystack":
          return await this.initializePaystackPayment(request)
        case "flutterwave":
          return await this.initializeFlutterwavePayment(request)
        default:
          throw new Error("Unsupported payment gateway")
      }
    } catch (error) {
      console.error("Payment initialization error:", error)
      return {
        success: false,
        reference: request.reference,
        message: "Failed to initialize payment",
      }
    }
  }

  private async initializePaystackPayment(request: PaymentRequest) {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: request.amount * 100, // Paystack expects amount in kobo
        email: request.email,
        reference: request.reference,
        callback_url: request.callback_url,
      }),
    })

    const data = await response.json()

    if (data.status) {
      return {
        success: true,
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        reference: data.data.reference,
        message: "Payment initialized successfully",
      }
    } else {
      throw new Error(data.message)
    }
  }

  private async initializeFlutterwavePayment(request: PaymentRequest) {
    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.flutterwaveSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: request.reference,
        amount: request.amount,
        currency: request.currency,
        redirect_url: request.callback_url,
        customer: {
          email: request.email,
        },
      }),
    })

    const data = await response.json()

    if (data.status === "success") {
      return {
        success: true,
        authorization_url: data.data.link,
        reference: request.reference,
        message: "Payment initialized successfully",
      }
    } else {
      throw new Error(data.message)
    }
  }

  async verifyPayment(
    gateway: "paystack" | "flutterwave",
    reference: string,
  ): Promise<{
    success: boolean
    status: string
    amount: number
    currency: string
    message: string
  }> {
    try {
      switch (gateway) {
        case "paystack":
          return await this.verifyPaystackPayment(reference)
        case "flutterwave":
          return await this.verifyFlutterwavePayment(reference)
        default:
          throw new Error("Unsupported payment gateway")
      }
    } catch (error) {
      console.error("Payment verification error:", error)
      return {
        success: false,
        status: "failed",
        amount: 0,
        currency: "NGN",
        message: "Payment verification failed",
      }
    }
  }

  private async verifyPaystackPayment(reference: string) {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${this.paystackSecretKey}`,
      },
    })

    const data = await response.json()

    if (data.status && data.data.status === "success") {
      return {
        success: true,
        status: "success",
        amount: data.data.amount / 100, // Convert from kobo
        currency: data.data.currency,
        message: "Payment verified successfully",
      }
    } else {
      return {
        success: false,
        status: data.data?.status || "failed",
        amount: 0,
        currency: "NGN",
        message: "Payment verification failed",
      }
    }
  }

  private async verifyFlutterwavePayment(reference: string) {
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${reference}`,
      {
        headers: {
          Authorization: `Bearer ${this.flutterwaveSecretKey}`,
        },
      },
    )

    const data = await response.json()

    if (data.status === "success" && data.data.status === "successful") {
      return {
        success: true,
        status: "success",
        amount: data.data.amount,
        currency: data.data.currency,
        message: "Payment verified successfully",
      }
    } else {
      return {
        success: false,
        status: data.data?.status || "failed",
        amount: 0,
        currency: "NGN",
        message: "Payment verification failed",
      }
    }
  }

  async getBankList(): Promise<
    Array<{
      name: string
      code: string
      longcode: string
      gateway: string
    }>
  > {
    try {
      const response = await fetch("https://api.paystack.co/bank", {
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
        },
      })

      const data = await response.json()

      if (data.status) {
        return data.data.map((bank: any) => ({
          name: bank.name,
          code: bank.code,
          longcode: bank.longcode,
          gateway: "paystack",
        }))
      }

      return []
    } catch (error) {
      console.error("Error fetching bank list:", error)
      return []
    }
  }

  async verifyBankAccount(
    account_number: string,
    bank_code: string,
  ): Promise<{
    valid: boolean
    account_name?: string
    account_number?: string
    bank_code?: string
  }> {
    try {
      const response = await fetch(
        `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
          },
        },
      )

      const data = await response.json()

      if (data.status) {
        return {
          valid: true,
          account_name: data.data.account_name,
          account_number: data.data.account_number,
          bank_code: bank_code,
        }
      }

      return { valid: false }
    } catch (error) {
      console.error("Bank account verification error:", error)
      return { valid: false }
    }
  }

  async createTransferRecipient(account: BankAccount): Promise<{
    success: boolean
    recipient_code?: string
    message: string
  }> {
    try {
      const response = await fetch("https://api.paystack.co/transferrecipient", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "nuban",
          name: account.account_name,
          account_number: account.account_number,
          bank_code: account.bank_code,
          currency: "NGN",
        }),
      })

      const data = await response.json()

      if (data.status) {
        return {
          success: true,
          recipient_code: data.data.recipient_code,
          message: "Transfer recipient created successfully",
        }
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Transfer recipient creation error:", error)
      return {
        success: false,
        message: "Failed to create transfer recipient",
      }
    }
  }

  async initiateTransfer(
    recipient_code: string,
    amount: number,
    reason: string,
  ): Promise<{
    success: boolean
    transfer_code?: string
    message: string
  }> {
    try {
      const response = await fetch("https://api.paystack.co/transfer", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "balance",
          amount: amount * 100, // Convert to kobo
          recipient: recipient_code,
          reason: reason,
        }),
      })

      const data = await response.json()

      if (data.status) {
        return {
          success: true,
          transfer_code: data.data.transfer_code,
          message: "Transfer initiated successfully",
        }
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Transfer initiation error:", error)
      return {
        success: false,
        message: "Failed to initiate transfer",
      }
    }
  }
}
