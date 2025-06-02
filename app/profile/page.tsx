"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Star, Shield, Camera, CheckCircle, Clock, TrendingUp, Award } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  const mockUser = {
    name: "John Adebayo",
    email: "john@example.com",
    phone: "+234 801 234 5678",
    location: "Lagos, Nigeria",
    joinDate: "January 2024",
    rating: 4.8,
    totalTrades: 127,
    successRate: 98.4,
    verified: true,
    bio: "Experienced crypto trader with focus on USDT and BNB. Fast payments and reliable service.",
  }

  const mockReviews = [
    {
      id: "1",
      reviewer: "Sarah M.",
      rating: 5,
      comment: "Very fast and reliable trader. Payment was instant!",
      date: "2024-01-10",
      tradeAmount: "100 USDT",
    },
    {
      id: "2",
      reviewer: "Mike O.",
      rating: 5,
      comment: "Excellent communication and smooth transaction.",
      date: "2024-01-08",
      tradeAmount: "2.5 BNB",
    },
    {
      id: "3",
      reviewer: "Ada K.",
      rating: 4,
      comment: "Good trader, though payment took a bit longer than expected.",
      date: "2024-01-05",
      tradeAmount: "50 USDT",
    },
  ]

  const mockStats = [
    { label: "Total Volume", value: "₦15.2M", icon: TrendingUp },
    { label: "Avg Response", value: "2 mins", icon: Clock },
    { label: "Completion Rate", value: "98.4%", icon: CheckCircle },
    { label: "Trust Score", value: "Excellent", icon: Award },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center text-blue-600 hover:text-blue-700">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P2P</span>
              </div>
              <span className="text-xl font-bold text-blue-900">Profile</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src="/placeholder.svg?height=96&width=96" />
                    <AvatarFallback className="text-2xl">JA</AvatarFallback>
                  </Avatar>
                  <Button size="sm" className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0">
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <h2 className="text-xl font-bold text-blue-900 mb-1">{mockUser.name}</h2>
                <p className="text-gray-600 text-sm mb-3">{mockUser.location}</p>

                <div className="flex items-center justify-center space-x-1 mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-bold text-lg">{mockUser.rating}</span>
                  <span className="text-gray-600">({mockUser.totalTrades} trades)</span>
                </div>

                <div className="flex items-center justify-center space-x-2 mb-4">
                  {mockUser.verified && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  <Badge className="bg-blue-100 text-blue-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Trusted
                  </Badge>
                </div>

                <p className="text-sm text-gray-600">Member since {mockUser.joinDate}</p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trading Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <stat.icon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">{stat.label}</span>
                    </div>
                    <span className="font-medium text-blue-900">{stat.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile Info</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="verification">Verification</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Manage your account details and preferences</CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                      {isEditing ? "Cancel" : "Edit Profile"}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name</Label>
                        <Input value={mockUser.name} disabled={!isEditing} className={!isEditing ? "bg-gray-50" : ""} />
                      </div>
                      <div>
                        <Label>Email Address</Label>
                        <Input
                          value={mockUser.email}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50" : ""}
                        />
                      </div>
                      <div>
                        <Label>Phone Number</Label>
                        <Input
                          value={mockUser.phone}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50" : ""}
                        />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input
                          value={mockUser.location}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50" : ""}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Bio</Label>
                      <Textarea
                        value={mockUser.bio}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50" : ""}
                        rows={3}
                      />
                    </div>
                    {isEditing && (
                      <div className="flex space-x-3">
                        <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Trading Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle>Trading Preferences</CardTitle>
                    <CardDescription>Set your default trading preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Preferred Cryptocurrencies</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {["USDT", "BNB", "TON", "SOL"].map((crypto) => (
                            <Badge key={crypto} variant="outline">
                              {crypto}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Payment Methods</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {["Bank Transfer", "Opay", "GTBank"].map((method) => (
                            <Badge key={method} variant="outline">
                              {method}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Reviews & Ratings</CardTitle>
                    <CardDescription>See what other traders say about you</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Rating Summary */}
                    <div className="flex items-center space-x-6 mb-6 p-4 bg-blue-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-900">{mockUser.rating}</div>
                        <div className="flex items-center justify-center space-x-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.floor(mockUser.rating) ? "text-yellow-500 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{mockUser.totalTrades} reviews</div>
                      </div>
                      <div className="flex-1">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center space-x-2 mb-1">
                            <span className="text-sm w-8">{rating}★</span>
                            <Progress value={rating === 5 ? 85 : rating === 4 ? 12 : 3} className="flex-1" />
                            <span className="text-sm text-gray-600 w-8">
                              {rating === 5 ? "85%" : rating === 4 ? "12%" : "3%"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Individual Reviews */}
                    <div className="space-y-4">
                      {mockReviews.map((review) => (
                        <div key={review.id} className="border-b pb-4 last:border-b-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-sm">{review.reviewer.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{review.reviewer}</p>
                                <div className="flex items-center space-x-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-3 h-3 ${
                                        star <= review.rating ? "text-yellow-500 fill-current" : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="text-right text-xs text-gray-500">
                              <p>{review.date}</p>
                              <p>{review.tradeAmount}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="verification" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Verification</CardTitle>
                    <CardDescription>Verify your identity to increase trust and trading limits</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Verification Items */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="font-medium">Email Verification</p>
                            <p className="text-sm text-gray-600">Your email has been verified</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Verified</Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="font-medium">Phone Verification</p>
                            <p className="text-sm text-gray-600">Your phone number has been verified</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Verified</Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="font-medium">BVN Verification</p>
                            <p className="text-sm text-gray-600">Your BVN has been verified</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Verified</Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-yellow-500" />
                          <div>
                            <p className="font-medium">Government ID</p>
                            <p className="text-sm text-gray-600">Upload a valid government-issued ID</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Upload ID
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-yellow-500" />
                          <div>
                            <p className="font-medium">Address Verification</p>
                            <p className="text-sm text-gray-600">Upload a utility bill or bank statement</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Upload Document
                        </Button>
                      </div>
                    </div>

                    {/* Verification Benefits */}
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Verification Benefits</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Higher trading limits</li>
                        <li>• Increased trust from other traders</li>
                        <li>• Priority customer support</li>
                        <li>• Access to premium features</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
