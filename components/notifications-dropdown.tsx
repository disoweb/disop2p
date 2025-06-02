"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { io, type Socket } from "socket.io-client"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
  data?: any
}

export function NotificationsDropdown() {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    fetchNotifications()
    setupWebSocket()

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  const setupWebSocket = () => {
    const token = localStorage.getItem("token")
    if (!token) return

    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000", {
      auth: { token },
    })

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket")
    })

    newSocket.on("notification", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((prev) => prev + 1)

      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
      })
    })

    newSocket.on("notification_marked_read", ({ notificationId }) => {
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    })

    newSocket.on("all_notifications_marked_read", () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    })

    setSocket(newSocket)
  }

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.data)
        setUnreadCount(data.data.filter((n: Notification) => !n.is_read).length)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    if (socket) {
      socket.emit("mark_notification_read", notificationId)
    }
  }

  const markAllAsRead = async () => {
    if (socket) {
      socket.emit("mark_all_notifications_read")
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
        setUnreadCount((prev) => {
          const notification = notifications.find((n) => n.id === notificationId)
          return notification && !notification.is_read ? prev - 1 : prev
        })
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "wallet":
        return "💰"
      case "kyc":
        return "🆔"
      case "trade":
        return "📈"
      case "system":
        return "⚙️"
      default:
        return "📢"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 md:w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-6 px-2 text-xs">
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`p-3 cursor-pointer ${
                    !notification.is_read ? "bg-blue-50 border-l-2 border-l-blue-500" : ""
                  }`}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <div className="text-lg">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4
                          className={`text-sm font-medium truncate ${
                            !notification.is_read ? "text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-1 ml-2">
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatTime(notification.created_at)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className={`text-xs mt-1 ${!notification.is_read ? "text-gray-700" : "text-gray-500"}`}>
                        {notification.message}
                      </p>
                      {!notification.is_read && (
                        <div className="flex items-center mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Mark read
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
