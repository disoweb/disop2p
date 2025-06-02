"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  Download,
  Filter,
  User,
  Calendar,
  FileText,
  Loader2,
} from "lucide-react"

interface KYCDocument {
  id: string
  user_id: string
  document_type: string
  document_number: string
  document_url: string
  verification_status: string
  created_at: string
  verified_at: string | null
  verified_by: string | null
  rejection_reason: string | null
  first_name: string
  last_name: string
  email: string
  phone: string
  kyc_level: number
  user_created_at: string
}

export default function AdminKYCPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("pending")
  const [documents, setDocuments] = useState<KYCDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDocument, setSelectedDocument] = useState<KYCDocument | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [isProcessing, setIsProcessing] = useState(false)
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    rejected: 0,
    total: 0,
  })

  useEffect(() => {
    fetchDocuments()
    fetchStats()
  }, [activeTab])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `/api/admin/kyc/documents?status=${activeTab}&search=${searchQuery}&type=${filterType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        setDocuments(data.data)
      } else {
        throw new Error("Failed to fetch documents")
      }
    } catch (error) {
      console.error("Error fetching KYC documents:", error)
      toast({
        title: "Error",
        description: "Failed to fetch KYC documents. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/kyc/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleViewDocument = (document: KYCDocument) => {
    setSelectedDocument(document)
    setShowViewDialog(true)
  }

  const handleApprovalAction = (document: KYCDocument, action: "approve" | "reject") => {
    setSelectedDocument(document)
    setShowApprovalDialog(true)
    if (action === "reject") {
      setRejectionReason("")
    }
  }

  const handleApproveDocument = async () => {
    if (!selectedDocument) return

    setIsProcessing(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/kyc/approve", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: selectedDocument.id,
          action: "approve",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Document approved",
          description: `${selectedDocument.document_type.replace("_", " ")} for ${selectedDocument.first_name} ${selectedDocument.last_name} has been approved.`,
        })

        setShowApprovalDialog(false)
        setShowViewDialog(false)
        fetchDocuments()
        fetchStats()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve document",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectDocument = async () => {
    if (!selectedDocument || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/kyc/approve", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: selectedDocument.id,
          action: "reject",
          reason: rejectionReason,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Document rejected",
          description: `${selectedDocument.document_type.replace("_", " ")} for ${selectedDocument.first_name} ${selectedDocument.last_name} has been rejected.`,
        })

        setShowApprovalDialog(false)
        setShowViewDialog(false)
        setRejectionReason("")
        fetchDocuments()
        fetchStats()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject document",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDocumentType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "verified":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.document_number.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filterType === "all" || doc.document_type === filterType

    return matchesSearch && matchesType
  })

  return (
    <div className="container py-6 md:py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">KYC Management</h1>
          <p className="text-gray-600">Review and verify user identity documents</p>
        </div>

        {/* Mobile-responsive filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email"
              className="pl-10 w-full sm:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by document" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Documents</SelectItem>
              <SelectItem value="national_id">National ID</SelectItem>
              <SelectItem value="passport">Passport</SelectItem>
              <SelectItem value="drivers_license">Driver's License</SelectItem>
              <SelectItem value="voters_card">Voter's Card</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards - Mobile responsive grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">Pending</p>
                <p className="text-lg md:text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">Verified</p>
                <p className="text-lg md:text-2xl font-bold">{stats.verified}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-lg md:text-2xl font-bold">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">Total</p>
                <p className="text-lg md:text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12 md:h-14 bg-white border shadow-sm">
          <TabsTrigger value="pending" className="text-xs md:text-sm font-medium">
            <div className="flex items-center">
              <Clock className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Pending</span>
              <Badge className="ml-1 md:ml-2 bg-yellow-100 text-yellow-800 text-xs">{stats.pending}</Badge>
            </div>
          </TabsTrigger>
          <TabsTrigger value="verified" className="text-xs md:text-sm font-medium">
            <div className="flex items-center">
              <CheckCircle className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Verified</span>
              <Badge className="ml-1 md:ml-2 bg-green-100 text-green-800 text-xs">{stats.verified}</Badge>
            </div>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs md:text-sm font-medium">
            <div className="flex items-center">
              <XCircle className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Rejected</span>
              <Badge className="ml-1 md:ml-2 bg-red-100 text-red-800 text-xs">{stats.rejected}</Badge>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle className="capitalize">{activeTab} Documents</CardTitle>
              <CardDescription>
                {activeTab === "pending"
                  ? "Review and verify user identity documents awaiting approval."
                  : activeTab === "verified"
                    ? "List of successfully verified identity documents."
                    : "List of rejected identity documents."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mobile Card View */}
                  <div className="block md:hidden space-y-4">
                    {filteredDocuments.map((document) => (
                      <Card key={document.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-sm">
                                {document.first_name} {document.last_name}
                              </h3>
                              <p className="text-xs text-gray-600">{document.email}</p>
                            </div>
                            <Badge className={`text-xs ${getStatusColor(document.verification_status)}`}>
                              {document.verification_status}
                            </Badge>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Document:</span>
                              <span>{formatDocumentType(document.document_type)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Number:</span>
                              <span className="font-mono">{document.document_number}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Submitted:</span>
                              <span>{formatDate(document.created_at)}</span>
                            </div>
                          </div>

                          <div className="flex space-x-2 mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDocument(document)}
                              className="flex-1 text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            {activeTab === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprovalAction(document, "approve")}
                                  className="flex-1 text-xs bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleApprovalAction(document, "reject")}
                                  className="flex-1 text-xs"
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Document Type</TableHead>
                          <TableHead>Document Number</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDocuments.map((document) => (
                          <TableRow key={document.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {document.first_name} {document.last_name}
                                  </p>
                                  <p className="text-sm text-gray-600">{document.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{formatDocumentType(document.document_type)}</TableCell>
                            <TableCell className="font-mono text-sm">{document.document_number}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{formatDate(document.created_at)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(document.verification_status)}>
                                {document.verification_status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleViewDocument(document)}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                {activeTab === "pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleApprovalAction(document, "approve")}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleApprovalAction(document, "reject")}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {filteredDocuments.length === 0 && (
                    <div className="text-center py-10">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No documents found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Document Review</DialogTitle>
            <DialogDescription>Review the submitted document and user information</DialogDescription>
          </DialogHeader>

          {selectedDocument && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">User Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span>
                        {selectedDocument.first_name} {selectedDocument.last_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{selectedDocument.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span>{selectedDocument.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">KYC Level:</span>
                      <span>{selectedDocument.kyc_level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Member Since:</span>
                      <span>{formatDate(selectedDocument.user_created_at)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Document Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span>{formatDocumentType(selectedDocument.document_type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number:</span>
                      <span className="font-mono">{selectedDocument.document_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={getStatusColor(selectedDocument.verification_status)}>
                        {selectedDocument.verification_status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted:</span>
                      <span>{formatDate(selectedDocument.created_at)}</span>
                    </div>
                    {selectedDocument.verified_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Verified:</span>
                        <span>{formatDate(selectedDocument.verified_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Document Image</h3>
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={selectedDocument.document_url || "/placeholder.svg"}
                    alt="Document"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
                <div className="flex space-x-2 mt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button variant="outline" onClick={() => setShowViewDialog(false)} className="w-full sm:w-auto">
              Close
            </Button>
            {selectedDocument?.verification_status === "pending" && (
              <>
                <Button
                  onClick={() => {
                    setShowViewDialog(false)
                    handleApprovalAction(selectedDocument, "approve")
                  }}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve Document
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowViewDialog(false)
                    handleApprovalAction(selectedDocument, "reject")
                  }}
                  className="w-full sm:w-auto"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject Document
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval/Rejection Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{rejectionReason !== undefined ? "Reject Document" : "Approve Document"}</DialogTitle>
            <DialogDescription>
              {rejectionReason !== undefined
                ? "Please provide a reason for rejecting this document."
                : "Are you sure you want to approve this document?"}
            </DialogDescription>
          </DialogHeader>

          {rejectionReason !== undefined && (
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Please specify why this document is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowApprovalDialog(false)
                setRejectionReason("")
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={rejectionReason !== undefined ? handleRejectDocument : handleApproveDocument}
              disabled={isProcessing || (rejectionReason !== undefined && !rejectionReason.trim())}
              className={`w-full sm:w-auto ${rejectionReason !== undefined ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : rejectionReason !== undefined ? (
                <XCircle className="h-4 w-4 mr-1" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-1" />
              )}
              {isProcessing ? "Processing..." : rejectionReason !== undefined ? "Reject" : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
