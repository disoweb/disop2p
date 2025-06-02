"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Star,
  Shield,
  Clock,
  Filter,
  Search,
  CheckCircle,
  Zap,
  MessageCircle,
  Phone,
  LogIn,
  UserPlus,
} from "lucide-react"
import Link from "next/link"

export function PublicTradeSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<any>(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

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
    {
      id: "4",
      type: "sell",
      trader: "John D.",
      rating: 4.7,
      trades: 567,
      crypto: "SOL",
      amount: "20",
      rate: "₦480,000",
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
    {
      id: "5",
      type: "buy",
      trader: "Grace N.",
      rating: 4.9,
      trades: 934,
      crypto: "TON",
      amount: "1000",
      rate: "₦8,500",
      payment: ["Opay", "Palmpay"],
      limits: "₦20,000 - ₦300,000",
      timeLimit: "20 mins",
      online: true,
      verified: true,
      completionRate: 99.1,
      avgResponseTime: "1m",
      lastSeen: "now",
      trustScore: "Excellent",
      totalVolume: "₦19.7M",
    },
  ]

  const handleTradeClick = (offer: any) => {
    setSelectedOffer(offer)
    setShowLoginPrompt(true)
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
              <label className="text-sm font-medium">Cryptocurrency</label>
              <select className="w-full mt-1 p-3 border border-gray-300 rounded-lg">
                <option>All Cryptos</option>
                <option>USDT</option>
                <option>BNB</option>
                <option>TON</option>
                <option>SOL</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Order Type</label>
              <select className="w-full mt-1 p-3 border border-gray-300 rounded-lg">
                <option>Buy & Sell</option>
                <option>Buy Orders</option>
                <option>Sell Orders</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Payment Method</label>
              <select className="w-full mt-1 p-3 border border-gray-300 rounded-lg">
                <option>All Methods</option>
                <option>Bank Transfer</option>
                <option>Mobile Money</option>
                <option>Opay</option>
              </select>
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
    <div className="space-y-6">
      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-12 bg-white border shadow-sm">
          <TabsTrigger value="browse" className="text-sm lg:text-base font-medium">
            Browse Live Offers
          </TabsTrigger>
          <TabsTrigger value="create" className="text-sm lg:text-base font-medium">
            Create Order
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Desktop Filters */}
          <Card className="hidden lg:block border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Cryptocurrency</label>
                  <select className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>All Cryptos</option>
                    <option>USDT</option>
                    <option>BNB</option>
                    <option>TON</option>
                    <option>SOL</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Order Type</label>
                  <select className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Buy & Sell</option>
                    <option>Buy Orders</option>
                    <option>Sell Orders</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Method</label>
                  <select className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>All Methods</option>
                    <option>Bank Transfer</option>
                    <option>Mobile Money</option>
                    <option>Opay</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Search Trader</label>
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

          {/* Mobile Search and Filter */}
          <div className="lg:hidden flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search traders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <FilterSheet />
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
                      <Button
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm"
                        onClick={() => handleTradeClick(offer)}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        {offer.type === "sell" ? "Buy" : "Sell"}
                      </Button>
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
                        <Button variant="outline" size="sm" disabled>
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" disabled>
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
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Create Your Trading Account</h3>
              <p className="text-gray-600 mb-6">
                To create orders and start trading, you need to sign up for a free account. It only takes 2 minutes!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="w-full sm:w-auto px-8">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Login Prompt Dialog */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Login Required</span>
            </DialogTitle>
            <DialogDescription>
              To complete this trade with {selectedOffer?.trader}, you need to login or create an account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedOffer && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span>Trader:</span>
                  <span className="font-medium">{selectedOffer.trader}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Amount:</span>
                  <span className="font-medium">
                    {selectedOffer.amount} {selectedOffer.crypto}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rate:</span>
                  <span className="font-medium">
                    {selectedOffer.rate} per {selectedOffer.crypto}
                  </span>
                </div>
              </div>
            )}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 text-sm">Why do I need to login?</p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• Secure escrow protection for your funds</li>
                    <li>• Identity verification for safe trading</li>
                    <li>• Access to chat and dispute resolution</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link href="/register" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up Free
                </Button>
              </Link>
              <Link href="/login" className="flex-1">
                <Button variant="outline" className="w-full">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
