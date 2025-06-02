"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Bitcoin,
  Shield,
  Users,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Star,
  Smartphone,
  Globe,
  Lock,
  Zap,
  Award,
  Play,
  Menu,
  X,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [email, setEmail] = useState("")

  const features = [
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: "Bank-Level Security",
      description:
        "Advanced encryption, multi-factor authentication, and secure escrow system protect every transaction.",
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Verified Community",
      description: "Trade with confidence knowing all users undergo comprehensive KYC verification.",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
      title: "Best Market Rates",
      description: "Competitive exchange rates with real-time pricing and transparent fee structure.",
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Instant Settlements",
      description: "Lightning-fast transactions with automated escrow release and instant bank transfers.",
    },
    {
      icon: <Smartphone className="h-8 w-8 text-pink-600" />,
      title: "Mobile Optimized",
      description: "Trade seamlessly on any device with our responsive, mobile-first design.",
    },
    {
      icon: <Award className="h-8 w-8 text-indigo-600" />,
      title: "24/7 Support",
      description: "Round-the-clock customer support and dispute resolution to ensure smooth trading.",
    },
  ]

  const stats = [
    { label: "Active Traders", value: "50K+", icon: <Users className="h-5 w-5" /> },
    { label: "Daily Volume", value: "₦2.5B+", icon: <TrendingUp className="h-5 w-5" /> },
    { label: "Success Rate", value: "99.8%", icon: <CheckCircle className="h-5 w-5" /> },
    { label: "User Rating", value: "4.9/5", icon: <Star className="h-5 w-5" /> },
  ]

  const cryptos = [
    { name: "USDT", price: "₦1,580", change: "+0.5%", isUp: true },
    { name: "BTC", price: "₦68M", change: "+2.1%", isUp: true },
    { name: "ETH", price: "₦4.5M", change: "-1.2%", isUp: false },
    { name: "BNB", price: "₦680K", change: "+3.4%", isUp: true },
  ]

  const testimonials = [
    {
      name: "Adebayo Johnson",
      role: "Crypto Trader",
      content:
        "CryptoPay has revolutionized how I trade crypto in Nigeria. The security and ease of use are unmatched.",
      rating: 5,
    },
    {
      name: "Sarah Okafor",
      role: "Business Owner",
      content: "I've been using CryptoPay for my business payments. Fast, reliable, and excellent customer support.",
      rating: 5,
    },
    {
      name: "Michael Eze",
      role: "Student",
      content: "As a beginner, CryptoPay made it easy for me to start trading crypto safely. Highly recommended!",
      rating: 5,
    },
  ]

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log("Newsletter subscription:", email)
    setEmail("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Bitcoin className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CryptoPay
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">
                How it Works
              </Link>
              <Link href="#security" className="text-gray-600 hover:text-blue-600 transition-colors">
                Security
              </Link>
              <Link href="#support" className="text-gray-600 hover:text-blue-600 transition-colors">
                Support
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Get Started
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t">
              <nav className="flex flex-col space-y-4 mt-4">
                <Link href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Features
                </Link>
                <Link href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">
                  How it Works
                </Link>
                <Link href="#security" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Security
                </Link>
                <Link href="#support" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Support
                </Link>
                <div className="flex flex-col space-y-2 pt-4">
                  <Link href="/login">
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="py-12 md:py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-6">
                <Zap className="h-4 w-4 mr-2" />
                Nigeria's #1 P2P Crypto Platform
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Trade Crypto
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                  Safely & Instantly
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Join over 50,000 Nigerians trading Bitcoin, USDT, and other cryptocurrencies with verified users. Secure
                escrow, instant payments, and the best rates guaranteed.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto"
                  >
                    Start Trading Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-600" />
                  Bank-level security
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  99.8% success rate
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-green-600" />
                  50K+ verified users
                </div>
              </div>
            </div>

            {/* Live Crypto Prices */}
            <div className="lg:pl-8">
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Live Crypto Prices</span>
                    <Badge className="bg-green-100 text-green-800">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Live
                    </Badge>
                  </CardTitle>
                  <CardDescription>Real-time market rates in Nigerian Naira</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cryptos.map((crypto, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                          <span className="font-bold text-white text-sm">{crypto.name}</span>
                        </div>
                        <div>
                          <p className="font-semibold">{crypto.name}</p>
                          <p className="text-2xl font-bold">{crypto.price}</p>
                        </div>
                      </div>
                      <Badge className={`${crypto.isUp ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {crypto.change}
                      </Badge>
                    </div>
                  ))}
                  <Link href="/register">
                    <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Start Trading These Assets
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-3 text-blue-200">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose CryptoPay?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the most secure, user-friendly, and feature-rich P2P cryptocurrency trading platform in
              Nigeria.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <CardHeader>
                  <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to start trading cryptocurrency safely</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Sign Up & Verify",
                description: "Create your account and complete our quick KYC verification process",
                icon: <Users className="h-8 w-8" />,
              },
              {
                step: "2",
                title: "Browse Offers",
                description: "Find the best buy/sell offers from our verified trader community",
                icon: <Globe className="h-8 w-8" />,
              },
              {
                step: "3",
                title: "Trade Securely",
                description: "Use our advanced escrow system for 100% secure transactions",
                icon: <Lock className="h-8 w-8" />,
              },
              {
                step: "4",
                title: "Get Paid Instantly",
                description: "Receive instant payments directly to your Nigerian bank account",
                icon: <Zap className="h-8 w-8" />,
              },
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    {item.step}
                  </div>
                  <div className="flex justify-center text-blue-600 group-hover:text-purple-600 transition-colors duration-300">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Bank-Level Security
                <span className="block text-blue-600">You Can Trust</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Your security is our top priority. We use advanced encryption, multi-factor authentication, and secure
                escrow systems to protect every transaction.
              </p>

              <div className="space-y-4">
                {[
                  "256-bit SSL encryption for all data transmission",
                  "Multi-factor authentication (2FA) for account security",
                  "Secure escrow system holds funds until trade completion",
                  "Regular security audits by third-party experts",
                  "Cold storage for cryptocurrency assets",
                  "24/7 fraud monitoring and detection",
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <Shield className="h-16 w-16 mb-6" />
                <h3 className="text-2xl font-bold mb-4">Your Funds Are Safe</h3>
                <p className="text-blue-100 mb-6">
                  We maintain the highest security standards in the industry to ensure your cryptocurrency and personal
                  information remain protected at all times.
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold">₦2.5B+</div>
                    <div className="text-blue-200 text-sm">Secured Daily</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">0</div>
                    <div className="text-blue-200 text-sm">Security Breaches</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600">Join thousands of satisfied traders across Nigeria</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Get the latest crypto news, market updates, and exclusive trading tips delivered to your inbox.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/70"
                required
              />
              <Button type="submit" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Subscribe
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Trading?</h2>
          <p className="text-xl mb-8 text-gray-600 max-w-2xl mx-auto">
            Join over 50,000 Nigerians who trust CryptoPay for safe and profitable cryptocurrency trading.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto"
              >
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/market">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto">
                View Live Market
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Bitcoin className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">CryptoPay</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Nigeria's most trusted P2P cryptocurrency trading platform. Trade Bitcoin, USDT, and other
                cryptocurrencies safely with verified users.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <Globe className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <Users className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <Shield className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/market" className="hover:text-white transition-colors">
                    Market
                  </Link>
                </li>
                <li>
                  <Link href="/trade" className="hover:text-white transition-colors">
                    Trade
                  </Link>
                </li>
                <li>
                  <Link href="/wallet" className="hover:text-white transition-colors">
                    Wallet
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="hover:text-white transition-colors">
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-white transition-colors">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="/fees" className="hover:text-white transition-colors">
                    Fees
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/compliance" className="hover:text-white transition-colors">
                    Compliance
                  </Link>
                </li>
                <li>
                  <Link href="/aml" className="hover:text-white transition-colors">
                    AML Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                &copy; 2024 CryptoPay. All rights reserved. Licensed by the Securities and Exchange Commission (SEC)
                Nigeria.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>🇳🇬 Made in Nigeria</span>
                <span>•</span>
                <span>Powered by Blockchain Technology</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
