"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import {
  Copy,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Info,
  ExternalLink,
  ArrowLeft,
  Wallet,
} from "lucide-react"
import Link from "next/link"

export default function WalletPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawAddress, setWithdrawAddress] = useState("")
  const [selectedCrypto, setSelectedCrypto] = useState("USDT")
  const [selectedBank, setSelectedBank] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [showDepositDialog, setShowDepositDialog] = useState(false)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)

  // Replace the walletBalances state with API data
  const [walletBalances, setWalletBalances] = useState([
    { currency: "USDT", balance: "1,250.00", nairaValue: "₦1,975,000", address: "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE" },
    {
      currency: "BTC",
      balance: "0.05",
      nairaValue: "₦3,425,000",
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    },
    {
      currency: "ETH",
      balance: "2.5",
      nairaValue: "₦10,500,000",
      address: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
    },
    { currency: "NGN", balance: "500,000", nairaValue: "₦500,000", address: "N/A" },
  ])
  const [recentTransactions, setRecentTransactions] = useState([
    {
      id: "1",
      type: "deposit",
      amount: "500 USDT",
      nairaValue: "₦790,000",
      date: "2024-01-15",
      status: "completed",
    },
    {
      id: "2",
      type: "withdrawal",
      amount: "0.01 BTC",
      nairaValue: "₦685,000",
      date: "2024-01-14",
      status: "pending",
    },
    {
      id: "3",
      type: "deposit",
      amount: "1 ETH",
      nairaValue: "₦4,200,000",
      date: "2024-01-13",
      status: "completed",
    },
  ])

  const banks = [
    { name: "Access Bank", code: "044" },
    { name: "First Bank", code: "011" },
    { name: "GTBank", code: "058" },
    { name: "UBA", code: "033" },
    { name: "Zenith Bank", code: "057" },
  ]

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast({
      title: "Address copied",
      description: "Wallet address has been copied to clipboard.",
    })
  }

  const handleDeposit = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currency: selectedCrypto,
          amount: depositAmount,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Deposit initiated",
          description: data.message,
        })
        setShowDepositDialog(false)
        setDepositAmount("")
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate deposit",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currency: selectedCrypto,
          amount: withdrawAmount,
          address: withdrawAddress,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Withdrawal initiated",
          description: data.message,
        })
        setShowWithdrawDialog(false)
        setWithdrawAmount("")
        setWithdrawAddress("")
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate withdrawal",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFiatWithdraw = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Fiat withdrawal initiated",
        description: `Your withdrawal of ₦${Number(withdrawAmount).toLocaleString()} to your bank account is being processed.`,
      })

      setShowWithdrawDialog(false)
      setWithdrawAmount("")
      setSelectedBank("")
      setAccountNumber("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate withdrawal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getTotalBalance = () => {
    return walletBalances.reduce((total, wallet) => {
      const nairaValue = Number.parseFloat(wallet.nairaValue.replace("₦", "").replace(",", ""))
      return total + nairaValue
    }, 0)
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
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Wallet
                  </h1>
                  <p className="text-sm text-slate-600 hidden sm:block">Manage your crypto assets</p>
                </div>
              </div>
            </div>

            {/* Mobile-optimized action buttons */}
            <div className="flex items-center space-x-2">
              <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
                  >
                    <ArrowDownLeft className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Deposit</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] mx-4">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Deposit Crypto</DialogTitle>
                    <DialogDescription>
                      Send funds to your wallet address. Only send {selectedCrypto} to this address.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="crypto" className="text-sm font-medium">
                        Select Cryptocurrency
                      </Label>
                      <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select cryptocurrency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USDT">USDT</SelectItem>
                          <SelectItem value="BTC">BTC</SelectItem>
                          <SelectItem value="ETH">ETH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-sm font-medium">
                        Amount
                      </Label>
                      <Input
                        id="amount"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.00"
                        type="number"
                        min="0"
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Wallet Address</Label>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-50 p-3 rounded-lg text-sm font-mono break-all border">
                          {walletBalances.find((w) => w.currency === selectedCrypto)?.address}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleCopyAddress(walletBalances.find((w) => w.currency === selectedCrypto)?.address || "")
                          }
                          className="h-12 w-12"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertTitle className="text-amber-800 text-sm font-medium">Important</AlertTitle>
                      <AlertDescription className="text-amber-700 text-sm">
                        Only send {selectedCrypto} to this address. Sending any other cryptocurrency may result in
                        permanent loss.
                      </AlertDescription>
                    </Alert>
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => setShowDepositDialog(false)} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDeposit}
                      disabled={!depositAmount || loading}
                      className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700"
                    >
                      {loading ? "Processing..." : "Confirm Deposit"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-slate-300 hover:bg-slate-50">
                    <ArrowUpRight className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Withdraw</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] mx-4">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Withdraw Funds</DialogTitle>
                    <DialogDescription>Withdraw your funds to an external wallet or bank account.</DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="crypto" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-12">
                      <TabsTrigger value="crypto" className="text-sm">
                        Crypto
                      </TabsTrigger>
                      <TabsTrigger value="fiat" className="text-sm">
                        Fiat (NGN)
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="crypto" className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="crypto" className="text-sm font-medium">
                          Select Cryptocurrency
                        </Label>
                        <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select cryptocurrency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USDT">USDT</SelectItem>
                            <SelectItem value="BTC">BTC</SelectItem>
                            <SelectItem value="ETH">ETH</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="amount" className="text-sm font-medium">
                            Amount
                          </Label>
                          <span className="text-xs text-slate-500">
                            Available: {walletBalances.find((w) => w.currency === selectedCrypto)?.balance}{" "}
                            {selectedCrypto}
                          </span>
                        </div>
                        <Input
                          id="amount"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="0.00"
                          type="number"
                          min="0"
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-sm font-medium">
                          Destination Address
                        </Label>
                        <Input
                          id="address"
                          value={withdrawAddress}
                          onChange={(e) => setWithdrawAddress(e.target.value)}
                          placeholder="Enter wallet address"
                          className="h-12"
                        />
                      </div>
                      <Alert className="bg-amber-50 border-amber-200">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-800 text-sm font-medium">Double-check the address</AlertTitle>
                        <AlertDescription className="text-amber-700 text-sm">
                          Withdrawals are irreversible. Please ensure you've entered the correct address.
                        </AlertDescription>
                      </Alert>
                      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowWithdrawDialog(false)}
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleWithdraw}
                          disabled={!withdrawAmount || !withdrawAddress || loading}
                          className="w-full sm:w-auto"
                        >
                          {loading ? "Processing..." : "Withdraw"}
                        </Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="fiat" className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="amount" className="text-sm font-medium">
                            Amount (NGN)
                          </Label>
                          <span className="text-xs text-slate-500">
                            Available: {walletBalances.find((w) => w.currency === "USDT")?.nairaValue}
                          </span>
                        </div>
                        <Input
                          id="amount"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="0.00"
                          type="number"
                          min="0"
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bank" className="text-sm font-medium">
                          Bank
                        </Label>
                        <Select value={selectedBank} onValueChange={setSelectedBank}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select bank" />
                          </SelectTrigger>
                          <SelectContent>
                            {banks.map((bank) => (
                              <SelectItem key={bank.code} value={bank.code}>
                                {bank.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountNumber" className="text-sm font-medium">
                          Account Number
                        </Label>
                        <Input
                          id="accountNumber"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="Enter account number"
                          maxLength={10}
                          className="h-12"
                        />
                      </div>
                      <Alert className="bg-blue-50 border-blue-200">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-800 text-sm font-medium">Processing Time</AlertTitle>
                        <AlertDescription className="text-blue-700 text-sm">
                          Bank withdrawals are typically processed within 1-2 business days.
                        </AlertDescription>
                      </Alert>
                      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowWithdrawDialog(false)}
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleFiatWithdraw}
                          disabled={!withdrawAmount || !selectedBank || !accountNumber || loading}
                          className="w-full sm:w-auto"
                        >
                          {loading ? "Processing..." : "Withdraw to Bank"}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Enhanced Total Balance Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white border-0 shadow-2xl">
          <CardContent className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              <div>
                <p className="text-blue-100 text-sm lg:text-base mb-2">Total Portfolio Value</p>
                <h2 className="text-3xl lg:text-5xl font-bold mb-2">₦{getTotalBalance().toLocaleString()}</h2>
                <p className="text-blue-200 text-sm">+2.5% from last week</p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
                <Button
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm w-full sm:w-auto"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Wallet Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {walletBalances.map((wallet) => (
            <Card
              key={wallet.currency}
              className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold text-slate-800">{wallet.currency}</CardTitle>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <span className="font-bold text-white text-lg">{wallet.currency.substring(0, 1)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-2xl lg:text-3xl font-bold text-slate-900">{wallet.balance}</p>
                  <p className="text-slate-600 text-sm lg:text-base">{wallet.nairaValue}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs border-green-200 text-green-700 hover:bg-green-50"
                    onClick={() => {
                      setSelectedCrypto(wallet.currency)
                      setShowDepositDialog(true)
                    }}
                  >
                    <ArrowDownLeft className="w-3 h-3 mr-1" />
                    Deposit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      setSelectedCrypto(wallet.currency)
                      setShowWithdrawDialog(true)
                    }}
                  >
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    Withdraw
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-14 bg-white/80 backdrop-blur-sm border shadow-lg">
            <TabsTrigger value="overview" className="text-sm lg:text-base font-medium">
              Portfolio Overview
            </TabsTrigger>
            <TabsTrigger value="transactions" className="text-sm lg:text-base font-medium">
              Transaction History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-800">Wallet Overview</CardTitle>
                <CardDescription className="text-slate-600">
                  View and manage all your cryptocurrency wallets.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200">
                        <TableHead className="font-semibold text-slate-700">Currency</TableHead>
                        <TableHead className="font-semibold text-slate-700">Balance</TableHead>
                        <TableHead className="hidden md:table-cell font-semibold text-slate-700">Value (NGN)</TableHead>
                        <TableHead className="hidden lg:table-cell font-semibold text-slate-700">
                          Wallet Address
                        </TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {walletBalances.map((wallet) => (
                        <TableRow key={wallet.currency} className="border-slate-100 hover:bg-slate-50/50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-md">
                                <span className="font-bold text-white">{wallet.currency.substring(0, 1)}</span>
                              </div>
                              <span className="font-semibold text-slate-800">{wallet.currency}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-slate-800">{wallet.balance}</TableCell>
                          <TableCell className="hidden md:table-cell font-medium text-slate-800">
                            {wallet.nairaValue}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-sm truncate max-w-[200px] text-slate-600">
                                {wallet.address}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-slate-100"
                                onClick={() => handleCopyAddress(wallet.address)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-green-700 hover:bg-green-50"
                                onClick={() => {
                                  setSelectedCrypto(wallet.currency)
                                  setShowDepositDialog(true)
                                }}
                              >
                                Deposit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-blue-700 hover:bg-blue-50"
                                onClick={() => {
                                  setSelectedCrypto(wallet.currency)
                                  setShowWithdrawDialog(true)
                                }}
                              >
                                Withdraw
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-800">Recent Transactions</CardTitle>
                <CardDescription className="text-slate-600">
                  View your recent deposit and withdrawal transactions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200">
                        <TableHead className="font-semibold text-slate-700">Type</TableHead>
                        <TableHead className="font-semibold text-slate-700">Amount</TableHead>
                        <TableHead className="hidden md:table-cell font-semibold text-slate-700">Value (NGN)</TableHead>
                        <TableHead className="hidden md:table-cell font-semibold text-slate-700">Date</TableHead>
                        <TableHead className="font-semibold text-slate-700">Status</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTransactions.map((tx) => (
                        <TableRow key={tx.id} className="border-slate-100 hover:bg-slate-50/50">
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {tx.type === "deposit" ? (
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                  <ArrowDownLeft className="h-4 w-4 text-green-600" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <ArrowUpRight className="h-4 w-4 text-blue-600" />
                                </div>
                              )}
                              <span className="capitalize font-medium text-slate-800">{tx.type}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-slate-800">{tx.amount}</TableCell>
                          <TableCell className="hidden md:table-cell font-medium text-slate-800">
                            {tx.nairaValue}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-slate-600">{tx.date}</TableCell>
                          <TableCell>
                            <Badge
                              className={`${
                                tx.status === "completed"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : tx.status === "pending"
                                    ? "bg-amber-100 text-amber-800 border-amber-200"
                                    : "bg-red-100 text-red-800 border-red-200"
                              }`}
                            >
                              {tx.status === "completed" && <CheckCircle className="mr-1 h-3 w-3" />}
                              {tx.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                              {tx.status === "failed" && <AlertTriangle className="mr-1 h-3 w-3" />}
                              {tx.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="h-8 hover:bg-slate-100">
                              <ExternalLink className="h-3 w-3 mr-1" /> View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline" className="w-full md:w-auto border-slate-300 hover:bg-slate-50">
                  View All Transactions
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
