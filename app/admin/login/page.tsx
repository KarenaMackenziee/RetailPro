"use client"

import type React from "react"

import { useState } from "react"
import { createClientClient } from "@/lib/supabase-client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ShieldCheck } from "lucide-react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClientClient()

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Get user data and check role
      const { data: userData } = await supabase.auth.getUser()
      if (userData?.user) {
        try {
          // Check if user is admin
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, is_admin")
            .eq("id", userData.user.id)
            .single()

          if (profile?.role !== "admin" && !profile?.is_admin) {
            // Sign out the user if they're not an admin
            await supabase.auth.signOut()
            throw new Error("Unauthorized: Admin access required")
          }

          // Update last login time
          await supabase.from("profiles").update({ last_login: new Date().toISOString() }).eq("id", userData.user.id)

          toast({
            title: "Admin Login Successful",
            description: "Welcome to the admin dashboard.",
          })

          router.push("/admin")
        } catch (updateError: any) {
          await supabase.auth.signOut()
          throw new Error("Unauthorized: Admin access required")
        }
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid admin credentials",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <ShieldCheck className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-gray-800">RetailPro Admin</CardTitle>
          <CardDescription className="text-center text-gray-600">
            Enter your admin credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                Admin Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@retailpro.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700">
                  Password
                </Label>
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-500"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Logging in..." : "Login to Admin Panel"}
            </Button>
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500">
                Not an admin?{" "}
                <a href="/login" className="text-blue-600 hover:underline">
                  User Login
                </a>
              </p>
              <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
                <p className="font-medium">Demo Admin Account:</p>
                <p>Email: karenajonemaryj@gmail.com</p>
                <p>Password: 67890@67890</p>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
