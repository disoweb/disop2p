"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    state: "",
    city: "",
    bvn: "",
    agreeTerms: false,
    agreePrivacy: false,
  })

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = () => {
    // Handle registration logic
    console.log("Registration data:", formData)
    // Redirect to verification page
    window.location.href = "/dashboard"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P2P</span>
            </div>
            <span className="text-xl font-bold text-blue-900">NaijaCrypto</span>
          </div>
          <h1 className="text-2xl font-bold text-blue-900">Create Your Account</h1>
          <p className="text-gray-600">Join Nigeria's most trusted crypto trading platform</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i <= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {i}
              </div>
              {i < 3 && <div className={`w-12 h-1 mx-2 ${i < step ? "bg-blue-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Personal Information"}
              {step === 2 && "Account Security"}
              {step === 3 && "Verification & Terms"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Enter your basic information"}
              {step === 2 && "Set up your account security"}
              {step === 3 && "Complete your registration"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+234 801 234 5678"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, state: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lagos">Lagos</SelectItem>
                        <SelectItem value="abuja">Abuja</SelectItem>
                        <SelectItem value="kano">Kano</SelectItem>
                        <SelectItem value="rivers">Rivers</SelectItem>
                        <SelectItem value="ogun">Ogun</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Ikeja"
                    />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Create a strong password"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 8 characters with uppercase, lowercase, and numbers
                  </p>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                  />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Security Features</span>
                  </div>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• Two-factor authentication (2FA)</li>
                    <li>• Email verification for withdrawals</li>
                    <li>• Advanced fraud detection</li>
                  </ul>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <Label htmlFor="bvn">BVN (Bank Verification Number)</Label>
                  <Input
                    id="bvn"
                    value={formData.bvn}
                    onChange={(e) => setFormData({ ...formData, bvn: e.target.value })}
                    placeholder="12345678901"
                    maxLength={11}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required for identity verification and compliance with Nigerian regulations
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                      I agree to the{" "}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and understand the risks associated with cryptocurrency trading
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="privacy"
                      checked={formData.agreePrivacy}
                      onCheckedChange={(checked) => setFormData({ ...formData, agreePrivacy: checked as boolean })}
                    />
                    <Label htmlFor="privacy" className="text-sm leading-relaxed">
                      I agree to the{" "}
                      <Link href="/privacy" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </Link>{" "}
                      and consent to data processing
                    </Label>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> You will need to verify your identity with a government-issued ID before
                    you can start trading.
                  </p>
                </div>
              </>
            )}

            <div className="flex space-x-3 pt-4">
              {step > 1 && (
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button onClick={handleNext} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!formData.agreeTerms || !formData.agreePrivacy}
                >
                  Create Account
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}
