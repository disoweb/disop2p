"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Bitcoin,
  Eye,
  UserCheck,
  UserX,
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingKYC: 0,
    totalTrades: 0,
    fraudAlerts: 0,
  })

  const [recentUsers, setRecentUsers] = useState([])
  const [pendingKYC, setPendingKYC] = useState([])
  const [recentTrades, setRecentTrades] = useState([])

  useEffect(() => {
    // Simulate loading data
    setStats({
      totalUsers: 1247,
      pendingKYC: 23,
      totalTrades: 5689,
      fraudAlerts: 3,
    })

    setRecentUsers([
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        status: "verified",
        joinDate: "2024-01-15",
        kycLevel: 2,
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        status: "pending",
        joinDate: "2024-01-14",
        kycLevel: 1,
      },
      {
        id: "3",
        name: "Mike Johnson",
        email: "mike@example.com",
        status: "rejected",
        joinDate: "2024-01-13",
        kycLevel: 0,
      },
    ])

    setPendingKYC([
      {
        id: "1",
        name: "Sarah Wilson",
        email: "sarah@example.com",
        documentType: "National ID",
        submittedAt: "2024-01-15 14:30",
      },
      {
        id: "2",
        name: "David Brown",
        email: "david@example.com",
        documentType: "Passport",
        submittedAt: "2024-01-15 12:15",
      },
    ])

    setRecentTrades([
      {
        id: "1",
        buyer: "John Doe",
        seller: "Jane Smith",
        amount: "500 USDT",
        value: "₦790,000",
        status: "completed",
        date: "2024-01-15",
      },
      {
        id: "2",
        buyer: "Mike Johnson",
        seller: "Sarah Wilson",
        amount: "0.01 BTC",
        value: "₦685,000",
        status: "pending",
        date: "2024-01-14",
      },
    ])
  }, [])

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
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Administrator
              </Badge>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">AD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+12 today</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Pending KYC</p>
                  <p className="text-2xl font-bold">{stats.pendingKYC}</p>
                  <p className="text-sm text-yellow-600">Needs review</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Total Trades</p>
                  <p className="text-2xl font-bold">{stats.totalTrades.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+45 today</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Fraud Alerts</p>
                  <p className="text-2xl font-bold">{stats.fraudAlerts}</p>
                  <p className="text-sm text-red-600">Requires attention</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="kyc">KYC Review</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest user registrations and their verification status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>KYC Level</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              user.status === "verified"
                                ? "bg-green-100 text-green-800"
                                : user.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {user.status === "verified" && <CheckCircle className="mr-1 h-3 w-3" />}
                            {user.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                            {user.status === "rejected" && <XCircle className="mr-1 h-3 w-3" />}
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>Level {user.kycLevel}</TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <UserCheck className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kyc">
            <Card>
              <CardHeader>
                <CardTitle>Pending KYC Reviews</CardTitle>
                <CardDescription>Identity documents awaiting verification</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingKYC.map((kyc) => (
                      <TableRow key={kyc.id}>
                        <TableCell className="font-medium">{kyc.name}</TableCell>
                        <TableCell>{kyc.email}</TableCell>
                        <TableCell>{kyc.documentType}</TableCell>
                        <TableCell>{kyc.submittedAt}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              Review
                            </Button>
                            <Button variant="outline" size="sm" className="text-green-600">
                              Approve
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600">
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trades">
            <Card>
              <CardHeader>
                <CardTitle>Recent Trades</CardTitle>
                <CardDescription>Latest trading activity on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTrades.map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell className="font-medium">{trade.buyer}</TableCell>
                        <TableCell>{trade.seller}</TableCell>
                        <TableCell>{trade.amount}</TableCell>
                        <TableCell>{trade.value}</TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>{trade.date}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Overview</CardTitle>
                <CardDescription>Monitor platform security and fraud detection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-medium">System Security</p>
                        <p className="text-sm text-gray-500">All systems operational</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Secure</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-8 w-8 text-yellow-600" />
                      <div>
                        <p className="font-medium">Fraud Alerts</p>
                        <p className="text-sm text-gray-500">3 alerts require review</p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Review</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
