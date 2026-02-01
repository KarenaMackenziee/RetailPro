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
import { ShoppingBag } from "lucide-react"

export default function LoginPage() {
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
          // Update last login time
          await supabase.from("profiles").update({ last_login: new Date().toISOString() }).eq("id", userData.user.id)

          toast({
            title: "Login Successful",
            description: "You have been successfully logged in.",
          })

          // Redirect to dashboard
          router.push("/dashboard")
        } catch (updateError) {
          console.warn("Could not update last_login:", updateError)
          // Continue even if this fails
          router.push("/dashboard")
        }
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <ShoppingBag className="h-10 w-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Denwa RetailPro</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <a href="/register" className="text-blue-600 hover:underline">
                  Sign up
                </a>
              </p>
              <p className="text-sm text-gray-500">
                Are you an admin?{" "}
                <a href="/admin/login" className="text-blue-600 hover:underline">
                  Admin Login
                </a>
              </p>
              <div className="text-xs text-gray-400">
                <p>Demo User Account:</p>
                <p>user@retailpro.com / user123</p>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
