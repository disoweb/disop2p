"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  Mail,
  AlertTriangle,
  HelpCircle,
  Search,
  ChevronRight,
  Shield,
  Zap,
} from "lucide-react"
import Link from "next/link"

export default function SupportPage() {
  const [ticketSubject, setTicketSubject] = useState("")
  const [ticketMessage, setTicketMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const faqCategories = [
    {
      title: "Getting Started",
      icon: HelpCircle,
      questions: [
        {
          question: "How do I create my first trade?",
          answer:
            "To create your first trade, go to the Trade page, select 'Create Order', choose buy or sell, enter your details, and publish your order.",
        },
        {
          question: "How do I verify my account?",
          answer:
            "Go to Profile > Verification and upload your government-issued ID and proof of address. Verification usually takes 24-48 hours.",
        },
        {
          question: "What payment methods are supported?",
          answer:
            "We support bank transfers, mobile money (Opay, Palmpay), and major Nigerian banks including GTBank, Access Bank, First Bank, and more.",
        },
      ],
    },
    {
      title: "Trading & Security",
      icon: Shield,
      questions: [
        {
          question: "How does the escrow system work?",
          answer:
            "When you start a trade, the seller's crypto is held in escrow until the buyer confirms payment. This protects both parties.",
        },
        {
          question: "What if there's a dispute?",
          answer:
            "If there's a dispute, our support team will review the evidence and make a fair decision. Always keep proof of payment.",
        },
        {
          question: "How long do trades take?",
          answer: "Most trades complete within 15-30 minutes. Payment time limits are set by individual traders.",
        },
      ],
    },
    {
      title: "Fees & Limits",
      icon: Zap,
      questions: [
        {
          question: "What are the trading fees?",
          answer: "We charge a 0.5% fee on completed trades. There are no fees for creating orders or canceling them.",
        },
        {
          question: "Are there any withdrawal limits?",
          answer:
            "Withdrawal limits depend on your verification level. Verified users can withdraw up to ₦10M per day.",
        },
        {
          question: "How do I increase my trading limits?",
          answer:
            "Complete account verification and maintain a good trading history to increase your limits automatically.",
        },
      ],
    },
  ]

  const supportTickets = [
    {
      id: "TKT-001",
      subject: "Payment not received",
      status: "open",
      priority: "high",
      created: "2024-01-15",
      lastUpdate: "2 hours ago",
    },
    {
      id: "TKT-002",
      subject: "Account verification issue",
      status: "resolved",
      priority: "medium",
      created: "2024-01-10",
      lastUpdate: "3 days ago",
    },
  ]

  const handleSubmitTicket = () => {
    if (!ticketSubject || !ticketMessage) {
      alert("Please fill in all fields")
      return
    }

    console.log("Submitting ticket:", { subject: ticketSubject, message: ticketMessage })
    alert("Support ticket submitted successfully! We'll get back to you within 24 hours.")
    setTicketSubject("")
    setTicketMessage("")
  }

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
                <span className="text-lg lg:text-xl font-bold text-gray-900">Support Center</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">How can we help you?</h1>
          <p className="text-gray-600 mb-6">Get quick answers or contact our support team</p>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Quick Contact */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Live Chat</h3>
              <p className="text-gray-600 text-sm mb-4">Get instant help from our support team</p>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                Start Chat
              </Button>
              <p className="text-xs text-green-600 mt-2">• Online now</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Phone Support</h3>
              <p className="text-gray-600 text-sm mb-4">Call us for urgent issues</p>
              <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
                +234 800 NAIJA-CRYPTO
              </Button>
              <p className="text-xs text-gray-500 mt-2">Mon-Fri 9AM-6PM WAT</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Email Support</h3>
              <p className="text-gray-600 text-sm mb-4">Send us a detailed message</p>
              <Button variant="outline" className="w-full border-purple-600 text-purple-600 hover:bg-purple-50">
                support@naijacrypto.com
              </Button>
              <p className="text-xs text-gray-500 mt-2">Response within 24 hours</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border shadow-sm">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
            <TabsTrigger value="contact">Contact Us</TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-6">
            <div className="space-y-6">
              {faqCategories.map((category, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <category.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <span>{category.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {category.questions.map((faq, faqIndex) => (
                      <div key={faqIndex} className="border-b last:border-b-0 pb-4 last:pb-0">
                        <button className="flex items-center justify-between w-full text-left">
                          <h4 className="font-medium text-gray-900">{faq.question}</h4>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                        <p className="text-gray-600 text-sm mt-2 leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">My Support Tickets</h2>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                Create New Ticket
              </Button>
            </div>

            <div className="space-y-4">
              {supportTickets.map((ticket) => (
                <Card key={ticket.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                          <p className="text-sm text-gray-600">Ticket ID: {ticket.id}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Created: {ticket.created} • Last update: {ticket.lastUpdate}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={ticket.status === "open" ? "default" : "secondary"}
                          className={`${
                            ticket.status === "open" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                          } mb-2`}
                        >
                          {ticket.status}
                        </Badge>
                        <br />
                        <Badge
                          variant="outline"
                          className={`${
                            ticket.priority === "high"
                              ? "border-red-200 text-red-600"
                              : "border-orange-200 text-orange-600"
                          }`}
                        >
                          {ticket.priority} priority
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Create Support Ticket</CardTitle>
                <CardDescription>
                  Describe your issue in detail and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium">Subject *</Label>
                  <Input
                    placeholder="Brief description of your issue"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <select className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Trading Issues</option>
                    <option>Payment Problems</option>
                    <option>Account Verification</option>
                    <option>Technical Support</option>
                    <option>Security Concerns</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <select className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Message *</Label>
                  <Textarea
                    placeholder="Please provide as much detail as possible about your issue..."
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    className="min-h-[120px] mt-1"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900 text-sm">Tips for faster resolution:</p>
                      <ul className="text-sm text-blue-700 mt-1 space-y-1">
                        <li>• Include relevant transaction IDs or order numbers</li>
                        <li>• Attach screenshots if applicable</li>
                        <li>• Provide step-by-step details of what happened</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSubmitTicket}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-12"
                >
                  Submit Ticket
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
