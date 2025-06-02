"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, Upload, Shield, ArrowRight, Camera, ArrowLeft, FileText } from "lucide-react"

export default function KYCPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  const [kycLevel, setKycLevel] = useState(1)
  const [kycStatus, setKycStatus] = useState("pending")
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "nigeria",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    bvn: "",
  })
  const [idVerification, setIdVerification] = useState({
    idType: "national_id",
    idNumber: "",
    expiryDate: "",
    frontImage: null as File | null,
    backImage: null as File | null,
    selfieImage: null as File | null,
  })

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalInfo({
      ...personalInfo,
      [e.target.name]: e.target.value,
    })
  }

  const handleIdVerificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdVerification({
      ...idVerification,
      [e.target.name]: e.target.value,
    })
  }

  const handleIdTypeChange = (value: string) => {
    setIdVerification({
      ...idVerification,
      idType: value,
    })
  }

  const handleFileUpload = (type: string, file: File) => {
    setIdVerification({
      ...idVerification,
      [type]: file,
    })
  }

  const handleSubmitPersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.dateOfBirth || !personalInfo.address) {
        throw new Error("Please fill in all required fields")
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Personal information saved",
        description: "Your personal information has been saved successfully.",
      })

      setActiveTab("identity")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save personal information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const uploadFileToCloudinary = async (file: File): Promise<string> => {
    // Simulate file upload - in production, use actual cloud storage
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`https://example.com/uploads/${file.name}`)
      }, 1000)
    })
  }

  const handleSubmitKYC = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!idVerification.idNumber || !idVerification.expiryDate) {
        throw new Error("Please fill in all ID verification fields")
      }

      if (!idVerification.frontImage || !idVerification.backImage || !idVerification.selfieImage) {
        throw new Error("Please upload all required documents")
      }

      // Upload files
      const frontImageUrl = await uploadFileToCloudinary(idVerification.frontImage)
      const backImageUrl = await uploadFileToCloudinary(idVerification.backImage)
      const selfieImageUrl = await uploadFileToCloudinary(idVerification.selfieImage)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Please login to continue")
      }

      const response = await fetch("/api/kyc/submit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalInfo,
          documents: [
            {
              type: idVerification.idType,
              number: idVerification.idNumber,
              expiryDate: idVerification.expiryDate,
              frontImageUrl,
              backImageUrl,
              selfieImageUrl,
            },
          ],
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "KYC submitted successfully",
          description: data.message,
        })
        setKycStatus("submitted")
        router.push("/dashboard?kyc=submitted")
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit KYC documents",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkKYCStatus()
  }, [])

  const checkKYCStatus = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/kyc/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setKycStatus(data.data.status)
        setKycLevel(data.data.level)
      }
    } catch (error) {
      console.error("Error checking KYC status:", error)
    }
  }

  const FileUploadComponent = ({
    label,
    accept,
    onFileSelected,
    required = false,
    icon,
    currentFile,
  }: {
    label: string
    accept: string
    onFileSelected: (file: File) => void
    required?: boolean
    icon: React.ReactNode
    currentFile?: File | null
  }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onFileSelected(file)
      }
    }

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id={`file-${label.replace(/\s+/g, "-").toLowerCase()}`}
            required={required}
          />
          <label
            htmlFor={`file-${label.replace(/\s+/g, "-").toLowerCase()}`}
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">{icon}</div>
            <div>
              <p className="text-sm font-medium text-slate-700">
                {currentFile ? currentFile.name : `Click to upload ${label.toLowerCase()}`}
              </p>
              <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
            </div>
          </label>
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
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                className="flex items-center text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Identity Verification
                  </h1>
                  <p className="text-sm text-slate-600 hidden sm:block">Complete your KYC verification</p>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="font-medium border-blue-200 text-blue-700">
              Level {kycLevel}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-slate-700">Verification Progress</span>
            <span className="text-sm text-slate-500">{Math.round(kycLevel * 33)}% Complete</span>
          </div>
          <Progress value={kycLevel * 33} className="h-3 bg-slate-200" />
          <div className="flex justify-between mt-3 text-xs text-slate-500">
            <span className={kycLevel >= 1 ? "text-blue-600 font-medium" : ""}>Basic Info</span>
            <span className={kycLevel >= 2 ? "text-blue-600 font-medium" : ""}>Identity Docs</span>
            <span className={kycLevel >= 3 ? "text-blue-600 font-medium" : ""}>Verified</span>
          </div>
        </div>

        {/* Security Notice */}
        <Alert className="mb-8 bg-blue-50 border-blue-200 shadow-lg">
          <Shield className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-800 font-semibold">Your data is secure</AlertTitle>
          <AlertDescription className="text-blue-700">
            All your personal information and documents are encrypted and securely stored. We comply with global data
            protection regulations and never share your data with third parties.
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-2 w-full h-16 bg-white/80 backdrop-blur-sm border shadow-lg">
            <TabsTrigger
              value="personal"
              disabled={activeTab === "identity" && kycStatus === "submitted"}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span className="hidden sm:inline">Personal Information</span>
              <span className="sm:hidden">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="identity" disabled={kycStatus === "submitted"} className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="hidden sm:inline">Identity Verification</span>
              <span className="sm:hidden">Identity</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-800">Personal Information</CardTitle>
                <CardDescription className="text-slate-600">
                  Please provide your personal details exactly as they appear on your official documents.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form id="personal-form" onSubmit={handleSubmitPersonalInfo}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={personalInfo.firstName}
                        onChange={handlePersonalInfoChange}
                        required
                        className="h-12"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={personalInfo.lastName}
                        onChange={handlePersonalInfoChange}
                        required
                        className="h-12"
                        placeholder="Enter your last name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                        Date of Birth <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={personalInfo.dateOfBirth}
                        onChange={handlePersonalInfoChange}
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationality" className="text-sm font-medium">
                        Nationality <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={personalInfo.nationality}
                        onValueChange={(value) => setPersonalInfo({ ...personalInfo, nationality: value })}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select nationality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nigeria">Nigeria</SelectItem>
                          <SelectItem value="ghana">Ghana</SelectItem>
                          <SelectItem value="kenya">Kenya</SelectItem>
                          <SelectItem value="south_africa">South Africa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address" className="text-sm font-medium">
                        Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="address"
                        name="address"
                        value={personalInfo.address}
                        onChange={handlePersonalInfoChange}
                        required
                        className="h-12"
                        placeholder="Enter your full address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium">
                        City <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        value={personalInfo.city}
                        onChange={handlePersonalInfoChange}
                        required
                        className="h-12"
                        placeholder="Enter your city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-sm font-medium">
                        State <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="state"
                        name="state"
                        value={personalInfo.state}
                        onChange={handlePersonalInfoChange}
                        required
                        className="h-12"
                        placeholder="Enter your state"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode" className="text-sm font-medium">
                        Postal Code
                      </Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={personalInfo.postalCode}
                        onChange={handlePersonalInfoChange}
                        className="h-12"
                        placeholder="Enter postal code"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bvn" className="text-sm font-medium">
                        BVN (Bank Verification Number)
                        <span className="text-xs text-slate-500 ml-2">(Optional, speeds up verification)</span>
                      </Label>
                      <Input
                        id="bvn"
                        name="bvn"
                        value={personalInfo.bvn}
                        onChange={handlePersonalInfoChange}
                        className="h-12"
                        placeholder="Enter your BVN"
                        maxLength={11}
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0">
                <Button variant="outline" onClick={() => router.push("/dashboard")} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="personal-form"
                  disabled={loading}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {loading ? "Saving..." : "Continue"}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="identity">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-800">Identity Verification</CardTitle>
                <CardDescription className="text-slate-600">
                  Please provide a valid government-issued ID document and a selfie for verification.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form id="kyc-form" onSubmit={handleSubmitKYC}>
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <Label htmlFor="idType" className="text-sm font-medium">
                        ID Document Type <span className="text-red-500">*</span>
                      </Label>
                      <Select value={idVerification.idType} onValueChange={handleIdTypeChange}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select ID type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="national_id">National ID Card</SelectItem>
                          <SelectItem value="drivers_license">Driver's License</SelectItem>
                          <SelectItem value="passport">International Passport</SelectItem>
                          <SelectItem value="voters_card">Voter's Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="idNumber" className="text-sm font-medium">
                          ID Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="idNumber"
                          name="idNumber"
                          value={idVerification.idNumber}
                          onChange={handleIdVerificationChange}
                          required
                          className="h-12"
                          placeholder="Enter ID number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate" className="text-sm font-medium">
                          Expiry Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          type="date"
                          value={idVerification.expiryDate}
                          onChange={handleIdVerificationChange}
                          required
                          className="h-12"
                        />
                      </div>
                    </div>

                    <Separator className="my-8" />

                    <div className="space-y-6">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <Label className="text-lg font-medium text-slate-800">Upload ID Document</Label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FileUploadComponent
                          label="Front of ID"
                          icon={<Upload className="h-6 w-6 text-blue-600" />}
                          accept="image/*"
                          onFileSelected={(file) => handleFileUpload("frontImage", file)}
                          required
                          currentFile={idVerification.frontImage}
                        />
                        <FileUploadComponent
                          label="Back of ID"
                          icon={<Upload className="h-6 w-6 text-blue-600" />}
                          accept="image/*"
                          onFileSelected={(file) => handleFileUpload("backImage", file)}
                          required
                          currentFile={idVerification.backImage}
                        />
                      </div>
                    </div>

                    <Separator className="my-8" />

                    <div className="space-y-6">
                      <div className="flex items-center space-x-2">
                        <Camera className="w-5 h-5 text-blue-600" />
                        <Label className="text-lg font-medium text-slate-800">Selfie Verification</Label>
                      </div>
                      <FileUploadComponent
                        label="Take a selfie or upload a photo"
                        icon={<Camera className="h-6 w-6 text-blue-600" />}
                        accept="image/*"
                        onFileSelected={(file) => handleFileUpload("selfieImage", file)}
                        required
                        currentFile={idVerification.selfieImage}
                      />
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-blue-800 mb-2">Selfie Requirements:</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
                          <li>Your face must be clearly visible</li>
                          <li>The photo should be well-lit</li>
                          <li>Do not wear sunglasses or a hat</li>
                          <li>Look directly at the camera</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0">
                <Button variant="outline" onClick={() => setActiveTab("personal")} className="w-full sm:w-auto">
                  Back
                </Button>
                <Button
                  type="submit"
                  form="kyc-form"
                  disabled={loading}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700"
                >
                  {loading ? "Submitting..." : "Submit for Verification"}
                  {!loading && <CheckCircle className="ml-2 h-4 w-4" />}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Success Message */}
        {kycStatus === "submitted" && (
          <Alert className="mt-8 bg-green-50 border-green-200 shadow-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-800 font-semibold">Verification in progress</AlertTitle>
            <AlertDescription className="text-green-700">
              Your KYC documents have been submitted and are being reviewed. This process typically takes 1-2 business
              days. You will be notified once the verification is complete.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
