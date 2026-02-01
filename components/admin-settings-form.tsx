"use client"

import type React from "react"

import { useState } from "react"
import { createClientClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AdminSettingsFormProps {
  profile: any
}

export default function AdminSettingsForm({ profile }: AdminSettingsFormProps) {
  const [firstName, setFirstName] = useState(profile?.first_name || "")
  const [lastName, setLastName] = useState(profile?.last_name || "")
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClientClient()

      // Validate phone number (simple validation)
      const phoneRegex = /^\d{10}$/
      if (phoneNumber && !phoneRegex.test(phoneNumber.replace(/\D/g, ""))) {
        throw new Error("Please enter a valid 10-digit phone number")
      }

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
        })
        .eq("id", profile?.id)

      if (updateError) throw updateError

      // Update user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      })

      if (authError) throw authError

      setSuccess(true)
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error: any) {
      setError(error.message || "An error occurred while updating your profile")
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating your profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Admin Profile</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>Profile updated successfully</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={profile?.email || ""} disabled className="bg-gray-100" />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="1234567890"
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
