"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Shield,
  Star,
  CheckCircle,
  Clock,
  Award,
  AlertTriangle,
  DollarSign,
  Activity,
  BarChart3,
  Wallet,
} from "lucide-react"
import Link from "next/link"

interface DashboardProps {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    rating: number
    totalTrades: number
    successfulTrades: number
    totalVolume: number
    isVerified: boolean
    kycLevel: number
  }
}

export function EnhancedDashboard({ user }: DashboardProps) {
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Trade Completed",
      message: "Your trade with Sarah M. has been completed successfully",
      type: "success",
      time: "2 mins ago",
      read: false,
    },
    {
      id: "2",
      title: "New Message",
      message: "Mike O. sent you a message about your USDT order",
      type: "message",
      time: "5 mins ago",
      read: false,
    },
    {
      id: "3",
      title: "Security Alert",
      message: "Login detected from new device in Lagos",
      type: "security",
      time: "1 hour ago",
      read: true,
    },
  ])

  const [recentTrades, setRecentTrades] = useState([
    {
      id: "1",
      type: "buy",
      crypto: "USDT",
      amount: "100",
      naira: "₦158,000",
      status: "completed",
      trader: "Sarah M.",
      date: "2024-01-15",
      profit: "+₦2,000",
    },
    {
      id: "2",
      type: "sell",
      crypto: "BNB",
      amount: "0.5",
      naira: "₦340,000",
      status: "pending",
      trader: "Mike O.",
      date: "2024-01-15",
      profit: "+₦5,000",
    },
    {
      id: "3",
      type: "buy",
      crypto: "SOL",
      amount: "2",
      naira: "₦960,000",
      status: "in_escrow",
      trader: "Ada K.",
      date: "2024-01-14",
      profit: "+₦15,000",
    },
  ])

  const [marketData, setMarketData] = useState([
    { symbol: "USDT", price: "₦1,580", change: "+0.5%", isUp: true, volume: "₦2.1B" },
    { symbol: "BNB", price: "₦680,000", change: "+2.1%", isUp: true, volume: "₦890M" },
    { symbol: "TON", price: "₦8,500", change: "-1.2%", isUp: false, volume: "₦456M" },
    { symbol: "SOL", price: "₦480,000", change: "+3.4%", isUp: true, volume: "₦1.2B" },
  ])

  const stats = [
    {
      title: "Total Portfolio",
      value: `₦${(user.totalVolume || 0).toLocaleString()}`,
      change: "+12.5%",
      isUp: true,
      icon: DollarSign,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Active Trades",
      value: "3",
      change: "+2",
      isUp: true,
      icon: Activity,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Success Rate",
      value: `${user.totalTrades > 0 ? ((user.successfulTrades / user.totalTrades) * 100).toFixed(1) : 0}%`,
      change: "+2.1%",
      isUp: true,
      icon: Award,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Trust Score",
      value: user.rating?.toFixed(1) || "0.0",
      change: "+0.2",
      isUp: true,
      icon: Shield,
      color: "from-orange-500 to-orange-600",
    },
  ]

  const quickActions = [
    {
      title: "Buy Crypto",
      description: "Purchase USDT, BNB, SOL, TON",
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
      href: "/trade?type=buy",
    },
    {
      title: "Sell Crypto",
      description: "Sell your crypto for Naira",
      icon: TrendingDown,
      color: "from-blue-500 to-blue-600",
      href: "/trade?type=sell",
    },
    {
      title: "Create Order",
      description: "Set your own rates",
      icon: Plus,
      color: "from-purple-500 to-purple-600",
      href: "/trade?tab=create",
    },
    {
      title: "Wallet",
      description: "Manage your funds",
      icon: Wallet,
      color: "from-orange-500 to-orange-600",
      href: "/wallet",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user.firstName}! 👋</h1>
              <p className="text-blue-100 text-lg">Ready to make some profitable trades today?</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-xl font-bold">{user.rating?.toFixed(1) || "0.0"}</span>
              </div>
              <p className="text-blue-100 text-sm">{user.totalTrades} trades completed</p>
            </div>
          </div>

          {/* KYC Status */}
          {!user.isVerified && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-300" />
                  <div>
                    <h3 className="font-semibold">Complete Your Verification</h3>
                    <p className="text-blue-100 text-sm">Unlock higher trading limits and premium features</p>
                  </div>
                </div>
                <Link href="/profile?tab=verification">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100">Verify Now</Button>
                </Link>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Verification Progress</span>
                  <span>{user.kycLevel * 33}%</span>
                </div>
                <Progress value={user.kycLevel * 33} className="h-2" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 hover:shadow-2xl transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <Badge className={`${stat.isUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} border-0`}>
                  {stat.change}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => (
          <Link key={index} href={action.href}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <action.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{action.title}</h3>
                <p className="text-gray-600 text-sm">{action.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-14 bg-white border shadow-sm">
          <TabsTrigger value="overview" className="text-sm font-medium">
            Overview
          </TabsTrigger>
          <TabsTrigger value="trades" className="text-sm font-medium">
            Recent Trades
          </TabsTrigger>
          <TabsTrigger value="market" className="text-sm font-medium">
            Market Data
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-sm font-medium">
            <div className="flex items-center space-x-2">
              <span>Notifications</span>
              {notifications.filter((n) => !n.read).length > 0 && (
                <Badge className="bg-red-500 text-white text-xs px-2 py-0">
                  {notifications.filter((n) => !n.read).length}
                </Badge>
              )}
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Trading Performance */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span>Trading Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Trades</span>
                    <span className="font-bold text-2xl">{user.totalTrades}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Successful Trades</span>
                    <span className="font-bold text-2xl text-green-600">{user.successfulTrades}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-bold text-2xl text-blue-600">
                      {user.totalTrades > 0 ? ((user.successfulTrades / user.totalTrades) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="pt-4">
                    <Progress
                      value={user.totalTrades > 0 ? (user.successfulTrades / user.totalTrades) * 100 : 0}
                      className="h-3"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>Account Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Email Verified</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Phone Verified</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">KYC Level</span>
                    <Badge
                      className={`${user.kycLevel >= 2 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      Level {user.kycLevel}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Trading Limit</span>
                    <span className="font-semibold">{user.kycLevel >= 2 ? "₦10M/day" : "₦1M/day"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trades" className="space-y-4">
          {recentTrades.map((trade) => (
            <Card key={trade.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        trade.type === "buy" ? "bg-green-100" : "bg-blue-100"
                      }`}
                    >
                      {trade.type === "buy" ? (
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {trade.type === "buy" ? "Bought" : "Sold"} {trade.amount} {trade.crypto}
                      </p>
                      <p className="text-gray-600">
                        {trade.naira} • with {trade.trader}
                      </p>
                      <p className="text-sm text-gray-500">{trade.date}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge
                      className={`${
                        trade.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : trade.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                      } font-medium mb-2`}
                    >
                      {trade.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
                      {trade.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                      {trade.status === "in_escrow" && <Shield className="w-3 h-3 mr-1" />}
                      {trade.status.replace("_", " ")}
                    </Badge>
                    <p className="text-sm font-semibold text-green-600">{trade.profit}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {marketData.map((crypto, index) => (
              <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-blue-700">{crypto.symbol}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-xl">{crypto.symbol}</h3>
                        <p className="text-gray-600 text-sm">24h Volume: {crypto.volume}</p>
                      </div>
                    </div>
                    <Badge
                      className={`${crypto.isUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} border-0`}
                    >
                      {crypto.change}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-gray-900">{crypto.price}</span>
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Buy
                      </Button>
                      <Button size="sm" variant="outline">
                        Sell
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                !notification.read ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      notification.type === "success"
                        ? "bg-green-100"
                        : notification.type === "message"
                          ? "bg-blue-100"
                          : "bg-orange-100"
                    }`}
                  >
                    {notification.type === "success" && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {notification.type === "message" && <MessageCircle className="w-5 h-5 text-blue-600" />}
                    {notification.type === "security" && <Shield className="w-5 h-5 text-orange-600" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{notification.title}</h4>
                    <p className="text-gray-600 mb-2">{notification.message}</p>
                    <p className="text-sm text-gray-500">{notification.time}</p>
                  </div>
                  {!notification.read && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
