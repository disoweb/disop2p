"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import {
  ArrowLeft,
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Copy,
} from "lucide-react"
import Link from "next/link"

export default function TradePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [trade, setTrade] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutes in seconds

  useEffect(() => {
    fetchTradeDetails()
    fetchMessages()

    // Setup WebSocket connection for real-time updates
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001")

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join_trade", tradeId: params.id }))
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === "new_message") {
        setMessages((prev) => [...prev, data.message])
      } else if (data.type === "trade_update") {
        setTrade(data.trade)
      }
    }

    return () => ws.close()
  }, [params.id])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const fetchTradeDetails = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/trades/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTrade(data.trade)
      }
    } catch (error) {
      console.error("Error fetching trade details:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/trades/${params.id}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/trades/${params.id}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: newMessage }),
      })

      if (response.ok) {
        setNewMessage("")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    }
  }

  const markAsPaid = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/trades/${params.id}/mark-paid`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Payment marked",
          description: "You have marked the payment as sent. Waiting for seller confirmation.",
        })
        fetchTradeDetails()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark payment",
        variant: "destructive",
      })
    }
  }

  const confirmPayment = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/trades/${params.id}/confirm-payment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Payment confirmed",
          description: "Trade completed successfully! Funds have been released.",
        })
        fetchTradeDetails()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm payment",
        variant: "destructive",
      })
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading trade details...</p>
        </div>
      </div>
    )
  }

  if (!trade) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Trade Not Found</h1>
          <p className="text-slate-600 mb-4">
            The trade you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link href="/p2p">
            <Button>Back to P2P Trading</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/p2p" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">P2P Trading</span>
              </Link>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Trade #{trade.id.slice(0, 8)}</h1>
                <p className="text-sm text-slate-600">
                  {trade.type === "buy" ? "Buying" : "Selling"} {trade.amount} {trade.crypto}
                </p>
              </div>
            </div>
            <Badge
              className={`${
                trade.status === "active"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : trade.status === "completed"
                    ? "bg-blue-100 text-blue-800 border-blue-200"
                    : "bg-red-100 text-red-800 border-red-200"
              }`}
            >
              {trade.status}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trade Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Timer Card */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Payment Timer</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 mb-2">{formatTime(timeLeft)}</div>
                  <Progress value={(timeLeft / 900) * 100} className="h-2 mb-4" />
                  <p className="text-sm text-slate-600">
                    {timeLeft > 0 ? "Time remaining for payment" : "Payment time expired"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Trade Info */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Trade Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Amount:</span>
                    <p className="font-semibold text-slate-900">
                      {trade.amount} {trade.crypto}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Rate:</span>
                    <p className="font-semibold text-slate-900">{trade.rate}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Total:</span>
                    <p className="font-semibold text-slate-900">{trade.total}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Fee:</span>
                    <p className="font-semibold text-slate-900">{trade.fee}</p>
                  </div>
                </div>

                {/* Escrow Info */}
                <Alert className="bg-blue-50 border-blue-200">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800 text-sm font-medium">Escrow Protection</AlertTitle>
                  <AlertDescription className="text-blue-700 text-sm">
                    Funds are securely held in escrow until trade completion.
                  </AlertDescription>
                </Alert>

                {/* Payment Details */}
                {trade.paymentDetails && (
                  <div className="p-4 bg-slate-50 rounded-lg border">
                    <h4 className="font-medium text-slate-900 mb-2">Payment Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Bank:</span>
                        <span className="font-medium">{trade.paymentDetails.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Account:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{trade.paymentDetails.accountNumber}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              navigator.clipboard.writeText(trade.paymentDetails.accountNumber)
                              toast({ title: "Copied", description: "Account number copied to clipboard" })
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Name:</span>
                        <span className="font-medium">{trade.paymentDetails.accountName}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  {trade.status === "active" && trade.type === "buy" && (
                    <Button onClick={markAsPaid} className="w-full bg-gradient-to-r from-green-600 to-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Paid
                    </Button>
                  )}

                  {trade.status === "payment_pending" && trade.type === "sell" && (
                    <Button onClick={confirmPayment} className="w-full bg-gradient-to-r from-blue-600 to-blue-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm Payment Received
                    </Button>
                  )}

                  <Button variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-50">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Report Issue
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Trader Info */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Trading Partner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                      {trade.partner?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900">{trade.partner?.name || "Anonymous"}</span>
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-sm text-slate-600">
                      {trade.partner?.rating || "4.9"} ⭐ • {trade.partner?.trades || "1,247"} trades
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Video className="w-4 h-4 mr-2" />
                    Video
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm h-[600px] flex flex-col">
              <CardHeader className="border-b bg-white/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <span>Trade Chat</span>
                    <Badge variant="outline" className="text-xs">
                      End-to-end encrypted
                    </Badge>
                  </CardTitle>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                        message.isMe
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                          : "bg-white text-slate-900 border border-slate-200"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className={`text-xs ${message.isMe ? "text-blue-100" : "text-slate-500"}`}>
                          {message.timestamp}
                        </p>
                        {message.isMe && <CheckCircle className="w-3 h-3 text-blue-200" />}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t bg-white/50 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 h-10"
                  />
                  <Button
                    onClick={sendMessage}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 flex-shrink-0"
                    size="sm"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Shield className="w-3 h-3" />
                      <span>Encrypted</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Escrow protected</span>
                    </div>
                  </div>
                  <span>Press Enter to send</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
