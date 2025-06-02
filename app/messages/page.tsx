"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  ArrowLeft,
  Send,
  Paperclip,
  MoreVertical,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Menu,
  Phone,
  Video,
} from "lucide-react"
import Link from "next/link"
import { MessageCircle } from "lucide-react" // Import MessageCircle

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState("1")
  const [newMessage, setNewMessage] = useState("")
  const [showChatList, setShowChatList] = useState(false)

  const mockChats = [
    {
      id: "1",
      trader: "Sarah M.",
      lastMessage: "Payment sent! Please check your account.",
      timestamp: "2 mins ago",
      unread: 2,
      status: "active",
      tradeId: "TRD-001",
      crypto: "USDT",
      amount: "100",
      online: true,
      verified: true,
      lastSeen: "now",
    },
    {
      id: "2",
      trader: "Mike O.",
      lastMessage: "Thanks for the quick trade!",
      timestamp: "1 hour ago",
      unread: 0,
      status: "completed",
      tradeId: "TRD-002",
      crypto: "BNB",
      amount: "2.5",
      online: false,
      verified: true,
      lastSeen: "1 hour ago",
    },
    {
      id: "3",
      trader: "Ada K.",
      lastMessage: "Can we extend the payment time?",
      timestamp: "3 hours ago",
      unread: 1,
      status: "dispute",
      tradeId: "TRD-003",
      crypto: "SOL",
      amount: "5",
      online: true,
      verified: true,
      lastSeen: "5 mins ago",
    },
  ]

  const mockMessages = [
    {
      id: "1",
      sender: "Sarah M.",
      message: "Hi! I'm interested in buying 100 USDT from you.",
      timestamp: "10:30 AM",
      isMe: false,
      status: "read",
    },
    {
      id: "2",
      sender: "You",
      message: "Great! The rate is ₦1,580 per USDT. Total will be ₦158,000.",
      timestamp: "10:32 AM",
      isMe: true,
      status: "read",
    },
    {
      id: "3",
      sender: "Sarah M.",
      message: "Perfect! I'll send the payment now via GTBank transfer.",
      timestamp: "10:35 AM",
      isMe: false,
      status: "read",
    },
    {
      id: "4",
      sender: "You",
      message: "Sounds good. Please send to: Account Name: John Adebayo, Account Number: 0123456789",
      timestamp: "10:36 AM",
      isMe: true,
      status: "read",
    },
    {
      id: "5",
      sender: "Sarah M.",
      message: "Payment sent! Please check your account.",
      timestamp: "10:45 AM",
      isMe: false,
      status: "delivered",
    },
  ]

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log("Sending message:", newMessage)
      setNewMessage("")
    }
  }

  const selectedChatData = mockChats.find((chat) => chat.id === selectedChat)

  const ChatListContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Active Trades</h2>
        <p className="text-sm text-gray-600">Secure messaging with traders</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {mockChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setSelectedChat(chat.id)
                setShowChatList(false)
              }}
              className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                selectedChat === chat.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 font-semibold">
                        {chat.trader.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${chat.online ? "bg-green-500" : "bg-gray-400"}`}
                    ></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-sm truncate">{chat.trader}</p>
                      {chat.verified && <CheckCircle className="w-3 h-3 text-blue-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500">
                      {chat.tradeId} • {chat.amount} {chat.crypto}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge
                    variant={
                      chat.status === "active" ? "default" : chat.status === "completed" ? "secondary" : "destructive"
                    }
                    className={`text-xs ${
                      chat.status === "active"
                        ? "bg-green-100 text-green-800"
                        : chat.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {chat.status}
                  </Badge>
                  {chat.unread > 0 && (
                    <div className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center mt-1 ml-auto">
                      {chat.unread}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-400">{chat.timestamp}</p>
                <p className="text-xs text-gray-400">{chat.online ? "Online" : `Last seen ${chat.lastSeen}`}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="flex items-center text-blue-600 hover:text-blue-700">
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">NC</span>
                </div>
                <span className="text-lg lg:text-xl font-bold text-gray-900">Messages</span>
              </div>
            </div>

            {/* Mobile chat list toggle */}
            <Sheet open={showChatList} onOpenChange={setShowChatList}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80">
                <ChatListContent />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Desktop Chat List */}
          <Card className="hidden lg:block lg:col-span-1 border-0 shadow-lg">
            <ChatListContent />
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-2 flex flex-col border-0 shadow-lg">
            {selectedChatData ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b bg-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12 border-2 border-blue-100">
                          <AvatarFallback className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 font-semibold">
                            {selectedChatData.trader.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${selectedChatData.online ? "bg-green-500" : "bg-gray-400"}`}
                        ></div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-gray-900">{selectedChatData.trader}</p>
                          {selectedChatData.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>Trade: {selectedChatData.tradeId}</span>
                          <span>•</span>
                          <span>
                            {selectedChatData.amount} {selectedChatData.crypto}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {selectedChatData.online ? "Online now" : `Last seen ${selectedChatData.lastSeen}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          selectedChatData.status === "active"
                            ? "default"
                            : selectedChatData.status === "completed"
                              ? "secondary"
                              : "destructive"
                        }
                        className={
                          selectedChatData.status === "active"
                            ? "bg-green-100 text-green-800"
                            : selectedChatData.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {selectedChatData.status}
                      </Badge>
                      <div className="hidden sm:flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Video className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {/* Trade Status */}
                {selectedChatData.status === "active" && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Waiting for payment confirmation</span>
                      </div>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          Mark as Paid
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-xs"
                        >
                          Confirm Payment
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedChatData.status === "dispute" && (
                  <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-b">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-900">
                        Dispute in progress - Support team notified
                      </span>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {mockMessages.map((message) => (
                    <div key={message.id} className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-sm ${
                          message.isMe
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                            : "bg-white text-gray-900 border border-gray-200"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className={`text-xs ${message.isMe ? "text-blue-100" : "text-gray-500"}`}>
                            {message.timestamp}
                          </p>
                          {message.isMe && (
                            <div className="flex items-center space-x-1">
                              <CheckCircle
                                className={`w-3 h-3 ${message.status === "read" ? "text-blue-200" : "text-blue-300"}`}
                              />
                              {message.status === "read" && <CheckCircle className="w-3 h-3 text-blue-200 -ml-2" />}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t bg-white rounded-b-lg">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="flex-shrink-0">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1 h-10"
                    />
                    <Button
                      onClick={handleSendMessage}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 flex-shrink-0"
                      size="sm"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Shield className="w-3 h-3" />
                        <span>End-to-end encrypted</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Trade protected by escrow</span>
                      </div>
                    </div>
                    <div className="text-gray-400">Press Enter to send</div>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Select a chat to start messaging</p>
                  <p className="text-sm">Choose from your active trades on the left</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
