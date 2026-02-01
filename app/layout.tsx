import type React from "react"
import { RecentlySoldProduct } from "@/components/recently-sold-product"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "@/app/globals.css"

export const metadata = {
  title: "RetailPro - Retail Management System",
  description: "A comprehensive retail management system",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="light">
          {/* @ts-expect-error Server Component */}
          <RecentlySoldProduct />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
