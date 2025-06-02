"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Star,
  Shield,
  Clock,
  Filter,
  Search,
  CheckCircle,
  Zap,
  TrendingUp,
  Plus,
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Phone,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function TradePage() {
  const router = useRouter()
  const [orderType, setOrderType] = useState("buy")
  const [selectedCrypto, setSelectedCrypto] = useState("USDT")
  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<any>(null)
  const [tradeAmount, setTradeAmount] = useState("")
  const [minOrder, setMinOrder] = useState("")
  const [maxOrder, setMaxOrder] = useState("")
  const [timeLimit, setTimeLimit] = useState("15")
  const [instructions, setInstructions] = useState("")

  const cryptos = [
    { symbol: "USDT", name: "Tether", rate: "₦1,580", change: "+0.5%", isUp: true },
    { symbol: "BNB", name: "Binance Coin", rate: "₦680,000", change: "+2.1%", isUp: true },
    { symbol: "TON", name: "Toncoin", rate: "₦8,500", change: "-1.2%", isUp: false },
    { symbol: "SOL", name: "Solana", rate: "₦480,000", change: "+3.4%", isUp: true },
  ]

  const paymentMethods = [
    "Bank Transfer",
    "Opay",
    "Palmpay",
    "Kuda Bank",
    "GTBank",
    "Access Bank",
    "First Bank",
    "Mobile Money",
    "Zenith Bank",
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
      crypto: "BNB",
      amount: "5",
      rate: "₦680,000",
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
  ]

  const handleCreateOrder = () => {
    if (!selectedCrypto || !amount || !rate || !paymentMethod || !minOrder || !maxOrder) {
      alert("Please fill in all required fields")
      return
    }

    const orderData = {
      type: orderType,
      crypto: selectedCrypto,
      amount,
      rate,
      paymentMethod,
      minOrder,
      maxOrder,
      timeLimit,
      instructions,
    }

    console.log("Creating order:", orderData)

    // Simulate order creation
    alert(
      `${orderType.toUpperCase()} order created successfully!\n\nDetails:\n- ${amount} ${selectedCrypto}\n- Rate: ${rate}\n- Payment: ${paymentMethod}`,
    )

    // Reset form
    setAmount("")
    setRate("")
    setPaymentMethod("")
    setMinOrder("")
    setMaxOrder("")
    setInstructions("")
  }

  const handleTradeClick = (offer: any) => {
    setSelectedOffer(offer)
  }

  const handleConfirmTrade = () => {
    if (!tradeAmount) {
      alert("Please enter trade amount")
      return
    }

    const amount = Number.parseFloat(tradeAmount)
    const minLimit = Number.parseFloat(selectedOffer.limits.split(" - ")[0].replace("₦", "").replace(",", ""))
    const maxLimit = Number.parseFloat(selectedOffer.limits.split(" - ")[1].replace("₦", "").replace(",", ""))

    if (amount < minLimit || amount > maxLimit) {
      alert(`Trade amount must be between ${selectedOffer.limits}`)
      return
    }

    console.log("Confirming trade:", {
      offer: selectedOffer,
      amount: tradeAmount,
    })

    alert(
      `Trade initiated successfully!\n\nYou will ${selectedOffer.type === "sell" ? "buy" : "sell"} ${tradeAmount} ${selectedOffer.crypto} from ${selectedOffer.trader}.\n\nRedirecting to chat...`,
    )

    setSelectedOffer(null)
    setTradeAmount("")
    router.push("/messages")
  }

  const FilterSheet = () => (
    <Sheet open={showFilters} onOpenChange={setShowFilters}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh]">
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-semibold">Filter Offers</h3>
          <div className="space-y-4">
            <div>
              <Label>Cryptocurrency</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cryptos</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                  <SelectItem value="BNB">BNB</SelectItem>
                  <SelectItem value="TON">TON</SelectItem>
                  <SelectItem value="SOL">SOL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Order Type</Label>
              <Select defaultValue="all">
                <SelectTrigger>
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
              <Label>Payment Method</Label>
              <Select defaultValue="all">
                <SelectTrigger>
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
            <Button onClick={() => setShowFilters(false)} className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">NC</span>
                </div>
                <span className="text-lg lg:text-xl font-bold text-gray-900">P2P Trading</span>
              </div>
            </div>
            <FilterSheet />
          </div>
        </div>
      </header>

      {/* Live Market Ticker */}
      <div className="bg-gray-900 text-white py-2 overflow-hidden">
        <div className="flex animate-scroll space-x-8">
          {[...cryptos, ...cryptos].map((crypto, index) => (
            <div key={index} className="flex items-center space-x-2 whitespace-nowrap">
              <span className="font-medium">{crypto.symbol}</span>
              <span className="text-gray-300">{crypto.rate}</span>
              <span className={`flex items-center text-sm ${crypto.isUp ? "text-green-400" : "text-red-400"}`}>
                {crypto.isUp ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                {crypto.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 lg:py-6">
        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12 bg-white border shadow-sm">
            <TabsTrigger value="browse" className="text-sm lg:text-base font-medium">
              Browse Offers
            </TabsTrigger>
            <TabsTrigger value="create" className="text-sm lg:text-base font-medium">
              Create Order
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Desktop Filters */}
            <Card className="hidden lg:block border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Filter className="w-5 h-5" />
                  <span>Filter Offers</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Cryptocurrency</Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cryptos</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                        <SelectItem value="BNB">BNB</SelectItem>
                        <SelectItem value="TON">TON</SelectItem>
                        <SelectItem value="SOL">SOL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Order Type</Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="mt-1">
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
                    <Label className="text-sm font-medium">Payment Method</Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="mt-1">
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
                    <Label className="text-sm font-medium">Search Trader</Label>
                    <div className="relative mt-1">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Search */}
            <div className="lg:hidden">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search traders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Offers List */}
            <div className="space-y-4">
              {mockOffers.map((offer) => (
                <Card key={offer.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4 lg:p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge
                            variant={offer.type === "buy" ? "default" : "secondary"}
                            className={`${offer.type === "buy" ? "bg-green-100 text-green-800 border-green-200" : "bg-blue-100 text-blue-800 border-blue-200"} font-semibold px-3 py-1`}
                          >
                            {offer.type === "buy" ? "BUYING" : "SELLING"}
                          </Badge>
                          <div>
                            <p className="font-bold text-xl text-gray-900">
                              {offer.amount} {offer.crypto}
                            </p>
                            <p className="text-gray-600">
                              Rate: <span className="font-semibold text-blue-600">{offer.rate}</span> per {offer.crypto}
                            </p>
                          </div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm"
                              onClick={() => handleTradeClick(offer)}
                            >
                              <Zap className="w-4 h-4 mr-2" />
                              {offer.type === "sell" ? "Buy" : "Sell"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Confirm Trade</DialogTitle>
                              <DialogDescription>
                                {offer.type === "sell" ? "Buy" : "Sell"} {offer.crypto} from {offer.trader}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between text-sm mb-2">
                                  <span>Rate:</span>
                                  <span className="font-medium">
                                    {offer.rate} per {offer.crypto}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm mb-2">
                                  <span>Limits:</span>
                                  <span className="font-medium">{offer.limits}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Payment Time:</span>
                                  <span className="font-medium">{offer.timeLimit}</span>
                                </div>
                              </div>
                              <div>
                                <Label>Amount (₦)</Label>
                                <Input
                                  type="number"
                                  placeholder="Enter amount in Naira"
                                  value={tradeAmount}
                                  onChange={(e) => setTradeAmount(e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                              <div className="flex space-x-2">
                                <Button variant="outline" className="flex-1" onClick={() => setSelectedOffer(null)}>
                                  Cancel
                                </Button>
                                <Button
                                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                                  onClick={handleConfirmTrade}
                                >
                                  Confirm Trade
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {/* Trader Info */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                              <AvatarFallback className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 font-semibold">
                                {offer.trader.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${offer.online ? "bg-green-500" : "bg-gray-400"}`}
                            ></div>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-900">{offer.trader}</span>
                              {offer.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                              <Badge variant="outline" className="text-xs px-2 py-0">
                                {offer.trustScore}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span>{offer.rating}</span>
                              </div>
                              <span>•</span>
                              <span>{offer.trades} trades</span>
                              <span>•</span>
                              <span>{offer.completionRate}% success</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {offer.online ? "Online now" : `Last seen ${offer.lastSeen}`} • Avg response:{" "}
                              {offer.avgResponseTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Phone className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Trade Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div className="p-3 bg-white border rounded-lg">
                          <p className="text-gray-500 mb-1">Trade Limits</p>
                          <p className="font-medium text-gray-900">{offer.limits}</p>
                        </div>
                        <div className="p-3 bg-white border rounded-lg">
                          <p className="text-gray-500 mb-1">Payment Time</p>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="font-medium text-gray-900">{offer.timeLimit}</span>
                          </div>
                        </div>
                        <div className="p-3 bg-white border rounded-lg">
                          <p className="text-gray-500 mb-1">Total Volume</p>
                          <p className="font-medium text-gray-900">{offer.totalVolume}</p>
                        </div>
                      </div>

                      {/* Payment Methods */}
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Payment Methods</p>
                        <div className="flex flex-wrap gap-2">
                          {offer.payment.map((method) => (
                            <Badge key={method} variant="outline" className="text-xs">
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
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Create New Order</CardTitle>
                <CardDescription>Set up your buy or sell order for other traders to find</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Type */}
                <div>
                  <Label className="text-base font-medium">Order Type</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <Button
                      variant={orderType === "buy" ? "default" : "outline"}
                      onClick={() => setOrderType("buy")}
                      className={`h-12 ${orderType === "buy" ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800" : ""}`}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />I want to BUY
                    </Button>
                    <Button
                      variant={orderType === "sell" ? "default" : "outline"}
                      onClick={() => setOrderType("sell")}
                      className={`h-12 ${orderType === "sell" ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" : ""}`}
                    >
                      <TrendingUp className="w-4 h-4 mr-2 rotate-180" />I want to SELL
                    </Button>
                  </div>
                </div>

                {/* Cryptocurrency Selection */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium">Cryptocurrency *</Label>
                    <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                      <SelectTrigger className="h-12 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {cryptos.map((crypto) => (
                          <SelectItem key={crypto.symbol} value={crypto.symbol}>
                            <div className="flex items-center justify-between w-full">
                              <span>
                                {crypto.symbol} - {crypto.name}
                              </span>
                              <span className={`text-xs ml-4 ${crypto.isUp ? "text-green-600" : "text-red-600"}`}>
                                {crypto.change}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Current Market Rate</Label>
                    <div className="mt-1 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <span className="text-lg font-bold text-blue-900">
                        {cryptos.find((c) => c.symbol === selectedCrypto)?.rate} per {selectedCrypto}
                      </span>
                      <p className="text-sm text-blue-600 mt-1">Live market rate</p>
                    </div>
                  </div>
                </div>

                {/* Amount and Rate */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium">Amount ({selectedCrypto}) *</Label>
                    <Input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      type="number"
                      className="h-12 mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Your Rate (₦ per {selectedCrypto}) *</Label>
                    <Input
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      placeholder="Enter your rate"
                      type="number"
                      className="h-12 mt-1"
                      required
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <Label className="text-sm font-medium">Preferred Payment Method *</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="h-12 mt-1">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Trading Limits */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium">Minimum Order (₦) *</Label>
                    <Input
                      placeholder="e.g., 10,000"
                      type="number"
                      className="h-12 mt-1"
                      value={minOrder}
                      onChange={(e) => setMinOrder(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Maximum Order (₦) *</Label>
                    <Input
                      placeholder="e.g., 500,000"
                      type="number"
                      className="h-12 mt-1"
                      value={maxOrder}
                      onChange={(e) => setMaxOrder(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Time Limit */}
                <div>
                  <Label className="text-sm font-medium">Payment Time Limit</Label>
                  <Select value={timeLimit} onValueChange={setTimeLimit}>
                    <SelectTrigger className="h-12 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Terms and Instructions */}
                <div>
                  <Label className="text-sm font-medium">Trading Instructions (Optional)</Label>
                  <Textarea
                    placeholder="Add any specific instructions for traders..."
                    className="min-h-[100px] mt-1"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  />
                </div>

                {/* Security Notice */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-blue-900 mb-2">Security Notice</p>
                      <p className="text-sm text-blue-700 leading-relaxed">
                        Your funds will be held in escrow until the trade is completed. Never release funds before
                        confirming payment receipt. Our system protects both buyers and sellers.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCreateOrder}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg h-12"
                  size="lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Order
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
