"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  TrendingUp,
  Wallet,
  Shield,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Eye,
  AlertTriangle,
  CheckCircle,
  Bitcoin,
} from "lucide-react"
import Link from "next/link"
import { NotificationsDropdown } from "@/components/notifications-dropdown"

export default function DashboardPage() {
  const [kycStatus] = useState("pending") // pending, verified, rejected

  const walletBalances = [
    { currency: "USDT", balance: "1,250.00", nairaValue: "₦1,975,000" },
    { currency: "BTC", balance: "0.05", nairaValue: "₦3,425,000" },
    { currency: "ETH", balance: "2.5", nairaValue: "₦10,500,000" },
    { currency: "NGN", balance: "500,000", nairaValue: "₦500,000" },
  ]

  const recentTrades = [
    {
      id: "1",
      type: "buy",
      amount: "500 USDT",
      rate: "₦1,580",
      total: "₦790,000",
      status: "completed",
      date: "2024-01-15",
    },
    {
      id: "2",
      type: "sell",
      amount: "0.01 BTC",
      rate: "₦68,500,000",
      total: "₦685,000",
      status: "pending",
      date: "2024-01-14",
    },
    {
      id: "3",
      type: "buy",
      amount: "1 ETH",
      rate: "₦4,200,000",
      total: "₦4,200,000",
      status: "completed",
      date: "2024-01-13",
    },
  ]

  const getTotalBalance = () => {
    return walletBalances.reduce((total, wallet) => {
      const nairaValue = Number.parseFloat(wallet.nairaValue.replace("₦", "").replace(",", ""))
      return total + nairaValue
    }, 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Bitcoin className="h-6 w-6 text-orange-500" />
                <span className="text-xl font-bold">CryptoPay</span>
              </Link>
              <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationsDropdown />
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">JD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* KYC Alert */}
        {kycStatus !== "verified" && (
          <Alert className="mb-8 bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <AlertTitle className="text-yellow-800">
              {kycStatus === "pending" ? "KYC Verification Pending" : "Complete Your KYC"}
            </AlertTitle>
            <AlertDescription className="text-yellow-700">
              {kycStatus === "pending"
                ? "Your identity verification is being reviewed. This may take 1-2 business days."
                : "Complete your identity verification to unlock higher trading limits and access all features."}
              <Link href="/kyc" className="ml-2 underline font-medium">
                {kycStatus === "pending" ? "View Status" : "Start Verification"}
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Balance</p>
                  <p className="text-2xl font-bold">₦{getTotalBalance().toLocaleString()}</p>
                </div>
                <Wallet className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Total Trades</p>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-sm text-green-600">+3 this week</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold">98%</p>
                  <p className="text-sm text-green-600">Excellent</p>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">KYC Status</p>
                  <Badge
                    className={
                      kycStatus === "verified"
                        ? "bg-green-100 text-green-800"
                        : kycStatus === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }
                  >
                    {kycStatus === "verified" && <CheckCircle className="mr-1 h-3 w-3" />}
                    {kycStatus === "pending" && <AlertTriangle className="mr-1 h-3 w-3" />}
                    {kycStatus}
                  </Badge>
                </div>
                <Shield className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wallet Overview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Wallet Overview</CardTitle>
                  <CardDescription>Your cryptocurrency balances</CardDescription>
                </div>
                <Link href="/wallet">
                  <Button variant="outline">
                    <Wallet className="mr-2 h-4 w-4" />
                    Manage Wallet
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {walletBalances.map((wallet) => (
                    <div key={wallet.currency} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="font-bold text-blue-700">{wallet.currency.substring(0, 1)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{wallet.currency}</p>
                          <p className="text-sm text-gray-500">{wallet.balance}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{wallet.nairaValue}</p>
                        <div className="flex space-x-2 mt-2">
                          <Button variant="outline" size="sm">
                            <ArrowDownLeft className="h-3 w-3 mr-1" />
                            Deposit
                          </Button>
                          <Button variant="outline" size="sm">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            Withdraw
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common trading actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/trade/buy">
                  <Button className="w-full justify-start" variant="outline">
                    <ArrowDownLeft className="mr-2 h-4 w-4 text-green-600" />
                    Buy Crypto
                  </Button>
                </Link>
                <Link href="/trade/sell">
                  <Button className="w-full justify-start" variant="outline">
                    <ArrowUpRight className="mr-2 h-4 w-4 text-blue-600" />
                    Sell Crypto
                  </Button>
                </Link>
                <Link href="/orders/create">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Order
                  </Button>
                </Link>
                <Link href="/market">
                  <Button className="w-full justify-start" variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    View Market
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Trades */}
        <Card className="mt-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Trades</CardTitle>
              <CardDescription>Your latest trading activity</CardDescription>
            </div>
            <Link href="/trades">
              <Button variant="outline">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        trade.type === "buy" ? "bg-green-100" : "bg-blue-100"
                      }`}
                    >
                      {trade.type === "buy" ? (
                        <ArrowDownLeft className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium capitalize">
                        {trade.type} {trade.amount}
                      </p>
                      <p className="text-sm text-gray-500">Rate: {trade.rate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{trade.total}</p>
                    <Badge
                      className={
                        trade.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : trade.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }
                    >
                      {trade.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
