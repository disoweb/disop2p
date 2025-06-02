"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import {
  ArrowLeft,
  Star,
  Shield,
  Clock,
  Search,
  CheckCircle,
  Zap,
  MessageCircle,
  Phone,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Filter,
  Plus,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function P2PPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("browse")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOffer, setSelectedOffer] = useState<any>(null)
  const [tradeAmount, setTradeAmount] = useState("")
  const [showTradeDialog, setShowTradeDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const cryptos = [
    { symbol: "USDT", name: "Tether", rate: "₦1,580", change: "+0.5%", isUp: true },
    { symbol: "BTC", name: "Bitcoin", rate: "₦68,500,000", change: "+2.1%", isUp: true },
    { symbol: "ETH", name: "Ethereum", rate: "₦4,200,000", change: "+1.8%", isUp: true },
    { symbol: "BNB", name: "Binance Coin", rate: "₦680,000", change: "-0.3%", isUp: false },
    { symbol: "SOL", name: "Solana", rate: "₦480,000", change: "+3.4%", isUp: true },
    { symbol: "TON", name: "Toncoin", rate: "₦8,500", change: "-1.2%", isUp: false },
  ]

  const mockOffers = [
    {
      id: "1",
      type: "sell",
      trader: "Sarah M.",
      rating: 4.9,
      trades: 1247,
      crypto: "USDT",
      amount: "50,000",
      rate: "₦1,580",
      payment: ["Bank Transfer", "Opay"],
      limits: "₦10,000 - ₦500,000",
      timeLimit: "15 mins",
      online: true,
      verified: true,
      completionRate: 99.2,
      avgResponseTime: "30s",
      lastSeen: "now",
      trustScore: "Excellent",
      totalVolume: "₦45.2M",
    },
    {
      id: "2",
      type: "sell",
      trader: "Mike O.",
      rating: 4.8,
      trades: 892,
      crypto: "USDT",
      amount: "100,000",
      rate: "₦1,575",
      payment: ["GTBank", "Access Bank"],
      limits: "₦50,000 - ₦1,000,000",
      timeLimit: "30 mins",
      online: false,
      verified: true,
      completionRate: 98.7,
      avgResponseTime: "1m",
      lastSeen: "5 mins ago",
      trustScore: "Very Good",
      totalVolume: "₦32.8M",
    },
    {
      id: "3",
      type: "buy",
      trader: "Ada K.",
      rating: 4.9,
      trades: 1456,
      crypto: "BTC",
      amount: "0.5",
      rate: "₦68,200,000",
      payment: ["Bank Transfer", "Palmpay"],
      limits: "₦100,000 - ₦2,000,000",
      timeLimit: "20 mins",
      online: true,
      verified: true,
      completionRate: 99.5,
      avgResponseTime: "45s",
      lastSeen: "now",
      trustScore: "Excellent",
      totalVolume: "₦67.1M",
    },
    {
      id: "4",
      type: "sell",
      trader: "John D.",
      rating: 4.7,
      trades: 567,
      crypto: "ETH",
      amount: "10",
      rate: "₦4,180,000",
      payment: ["Bank Transfer", "Kuda Bank"],
      limits: "₦50,000 - ₦800,000",
      timeLimit: "25 mins",
      online: true,
      verified: true,
      completionRate: 97.8,
      avgResponseTime: "2m",
      lastSeen: "now",
      trustScore: "Very Good",
      totalVolume: "₦28.5M",
    },
  ]

  const handleTradeClick = (offer: any) => {
    setSelectedOffer(offer)
    setShowTradeDialog(true)
  }

  const handleConfirmTrade = async () => {
    if (!tradeAmount) {
      toast({
        title: "Error",
        description: "Please enter trade amount",
        variant: "destructive",
      })
      return
    }

    const amount = Number.parseFloat(tradeAmount)
    const minLimit = Number.parseFloat(selectedOffer.limits.split(" - ")[0].replace("₦", "").replace(",", ""))
    const maxLimit = Number.parseFloat(selectedOffer.limits.split(" - ")[1].replace("₦", "").replace(",", ""))

    if (amount < minLimit || amount > maxLimit) {
      toast({
        title: "Error",
        description: `Trade amount must be between ${selectedOffer.limits}`,
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/trades/initiate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          offerId: selectedOffer.id,
          amount: tradeAmount,
          type: selectedOffer.type === "sell" ? "buy" : "sell",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Trade initiated successfully!",
          description: `You will ${selectedOffer.type === "sell" ? "buy" : "sell"} ${tradeAmount} ${selectedOffer.crypto} from ${selectedOffer.trader}.`,
        })

        setShowTradeDialog(false)
        setTradeAmount("")
        router.push(`/p2p/trade/${data.tradeId}`)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate trade",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    P2P Trading
                  </h1>
                  <p className="text-sm text-slate-600 hidden sm:block">Trade crypto peer-to-peer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Live Market Ticker */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-3 overflow-hidden">
        <div className="flex animate-scroll space-x-8">
          {[...cryptos, ...cryptos].map((crypto, index) => (
            <div key={index} className="flex items-center space-x-3 whitespace-nowrap">
              <span className="font-semibold text-lg">{crypto.symbol}</span>
              <span className="text-slate-300">{crypto.rate}</span>
              <span
                className={`flex items-center text-sm font-medium ${crypto.isUp ? "text-green-400" : "text-red-400"}`}
              >
                {crypto.isUp ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                {crypto.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 lg:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 h-14 bg-white/80 backdrop-blur-sm border shadow-lg">
            <TabsTrigger value="browse" className="text-sm lg:text-base font-medium">
              Browse Offers
            </TabsTrigger>
            <TabsTrigger value="create" className="text-sm lg:text-base font-medium">
              Create Order
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Enhanced Search and Filters */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Filter className="w-5 h-5 text-blue-600" />
                  <span>Filter Offers</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Cryptocurrency</Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="mt-2 h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cryptos</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                        <SelectItem value="BTC">Bitcoin</SelectItem>
                        <SelectItem value="ETH">Ethereum</SelectItem>
                        <SelectItem value="BNB">BNB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Order Type</Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="mt-2 h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Buy & Sell</SelectItem>
                        <SelectItem value="buy">Buy Orders</SelectItem>
                        <SelectItem value="sell">Sell Orders</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Payment Method</Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="mt-2 h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                        <SelectItem value="mobile">Mobile Money</SelectItem>
                        <SelectItem value="opay">Opay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Search Trader</Label>
                    <div className="relative mt-2">
                      <Search className="w-4 h-4 absolute left-3 top-4 text-slate-400" />
                      <Input
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Offers List */}
            <div className="space-y-6">
              {mockOffers.map((offer) => (
                <Card
                  key={offer.id}
                  className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
                >
                  <CardContent className="p-6 lg:p-8">
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0">
                        <div className="flex items-center space-x-4">
                          <Badge
                            variant={offer.type === "buy" ? "default" : "secondary"}
                            className={`${
                              offer.type === "buy"
                                ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-0"
                                : "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0"
                            } font-semibold px-4 py-2 text-sm`}
                          >
                            {offer.type === "buy" ? "BUYING" : "SELLING"}
                          </Badge>
                          <div>
                            <p className="font-bold text-2xl lg:text-3xl text-slate-900">
                              {offer.amount} {offer.crypto}
                            </p>
                            <p className="text-slate-600 text-lg">
                              Rate: <span className="font-semibold text-blue-600">{offer.rate}</span> per {offer.crypto}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="lg"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg text-white border-0 px-8"
                          onClick={() => handleTradeClick(offer)}
                        >
                          <Zap className="w-5 h-5 mr-2" />
                          {offer.type === "sell" ? "Buy Now" : "Sell Now"}
                        </Button>
                      </div>

                      {/* Enhanced Trader Info */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-slate-200">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-xl">
                                {offer.trader.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white shadow-lg ${
                                offer.online ? "bg-green-500" : "bg-slate-400"
                              }`}
                            ></div>
                          </div>
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="font-bold text-xl text-slate-900">{offer.trader}</span>
                              {offer.verified && <CheckCircle className="w-5 h-5 text-blue-500" />}
                              <Badge
                                variant="outline"
                                className="text-sm px-3 py-1 border-blue-200 text-blue-700 bg-blue-50"
                              >
                                {offer.trustScore}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-slate-600 mb-1">
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="font-medium">{offer.rating}</span>
                              </div>
                              <span>•</span>
                              <span className="font-medium">{offer.trades} trades</span>
                              <span>•</span>
                              <span className="font-medium">{offer.completionRate}% success</span>
                            </div>
                            <p className="text-sm text-slate-500">
                              {offer.online ? "🟢 Online now" : `🔴 Last seen ${offer.lastSeen}`} • Avg response:{" "}
                              {offer.avgResponseTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-3 mt-4 lg:mt-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Chat
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-200 text-green-700 hover:bg-green-50"
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Call
                          </Button>
                        </div>
                      </div>

                      {/* Enhanced Trade Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                          <p className="text-slate-500 text-sm mb-2 font-medium">Trade Limits</p>
                          <p className="font-bold text-slate-900 text-lg">{offer.limits}</p>
                        </div>
                        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                          <p className="text-slate-500 text-sm mb-2 font-medium">Payment Time</p>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="font-bold text-slate-900 text-lg">{offer.timeLimit}</span>
                          </div>
                        </div>
                        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                          <p className="text-slate-500 text-sm mb-2 font-medium">Total Volume</p>
                          <p className="font-bold text-slate-900 text-lg">{offer.totalVolume}</p>
                        </div>
                      </div>

                      {/* Payment Methods */}
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-3">Accepted Payment Methods</p>
                        <div className="flex flex-wrap gap-2">
                          {offer.payment.map((method) => (
                            <Badge
                              key={method}
                              variant="outline"
                              className="text-sm px-3 py-1 border-slate-300 bg-slate-50"
                            >
                              {method}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-800">Create New Order</CardTitle>
                <CardDescription className="text-slate-600 text-lg">
                  Set up your buy or sell order for other traders to find
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="bg-blue-50 border-blue-200 mb-6">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <AlertTitle className="text-blue-800 font-semibold">Complete KYC Required</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    You need to complete your identity verification to create trading orders.{" "}
                    <Link href="/kyc" className="underline font-medium">
                      Complete KYC now
                    </Link>
                  </AlertDescription>
                </Alert>
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Plus className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Ready to Start Trading?</h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    Complete your KYC verification to unlock order creation and start trading with other users.
                  </p>
                  <Link href="/kyc">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8"
                    >
                      Complete Verification
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Trade Dialog */}
        <Dialog open={showTradeDialog} onOpenChange={setShowTradeDialog}>
          <DialogContent className="sm:max-w-md mx-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Confirm Trade</DialogTitle>
              <DialogDescription>
                {selectedOffer?.type === "sell" ? "Buy" : "Sell"} {selectedOffer?.crypto} from {selectedOffer?.trader}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Rate:</span>
                    <p className="font-semibold text-slate-900">
                      {selectedOffer?.rate} per {selectedOffer?.crypto}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Limits:</span>
                    <p className="font-semibold text-slate-900">{selectedOffer?.limits}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Payment Time:</span>
                    <p className="font-semibold text-slate-900">{selectedOffer?.timeLimit}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Success Rate:</span>
                    <p className="font-semibold text-slate-900">{selectedOffer?.completionRate}%</p>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Amount (₦)</Label>
                <Input
                  type="number"
                  placeholder="Enter amount in Naira"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  className="mt-2 h-12"
                />
              </div>
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800 text-sm font-medium">Important</AlertTitle>
                <AlertDescription className="text-amber-700 text-sm">
                  Your funds will be held in escrow until the trade is completed. Never release funds before confirming
                  payment receipt.
                </AlertDescription>
              </Alert>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowTradeDialog(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={handleConfirmTrade}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Confirm Trade"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
