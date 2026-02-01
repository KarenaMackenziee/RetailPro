"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientClient } from "@/lib/supabase-client"
import { useToast } from "@/hooks/use-toast"

interface NotificationsContextType {
  hasUnreadNotifications: boolean
  markAllAsRead: () => void
}

const NotificationsContext = createContext<NotificationsContextType>({
  hasUnreadNotifications: false,
  markAllAsRead: () => {},
})

export const useNotifications = () => useContext(NotificationsContext)

export function NotificationsProvider({ children, userId }: { children: React.ReactNode; userId: string }) {
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!userId) return

    const supabase = createClientClient()

    // Subscribe to order status changes for this user
    const subscription = supabase
      .channel("order-notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Check if status has changed
          if (payload.old.status !== payload.new.status) {
            setHasUnreadNotifications(true)

            // Show toast notification
            toast({
              title: "Order Status Updated",
              description: `Order #${payload.new.id} status has been updated to ${payload.new.status}`,
            })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [userId, toast])

  const markAllAsRead = () => {
    setHasUnreadNotifications(false)
  }

  return (
    <NotificationsContext.Provider value={{ hasUnreadNotifications, markAllAsRead }}>
      {children}
    </NotificationsContext.Provider>
  )
}
