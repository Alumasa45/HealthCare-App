import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
  userId?: number;
  appointmentId?: number;
  patientId?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isWebSocketConnected: boolean;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  useEffect(() => {
    // Load notifications from localStorage
    const savedNotifications = localStorage.getItem("notifications");
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(
          parsed.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          }))
        );
      } catch (error) {
        console.error("Error loading notifications from localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    // Save notifications to localStorage
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  // WebSocket connection for real-time notifications
  // This is optional functionality - the app works fine without it
  useEffect(() => {
    if (!user?.User_id) return;

    let ws: WebSocket | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    let reconnectTimeout: NodeJS.Timeout;

    const connectWebSocket = () => {
      try {
        // Skip if already trying to connect
        if (ws && ws.readyState === WebSocket.CONNECTING) {
          console.log("WebSocket connection already in progress...");
          return;
        }

        // Determine WebSocket URL based on API client configuration
        const wsBaseUrl = "https://healthcare-app-60pj.onrender.com"
          .replace("https://", "wss://")
          .replace("http://", "ws://");

        console.log(
          `🔌 Attempting WebSocket connection to: ${wsBaseUrl}/notifications?userId=${user.User_id}`
        );

        // Set up WebSocket connection for real-time notifications
        ws = new WebSocket(`${wsBaseUrl}/notifications?userId=${user.User_id}`);

        // Set a timeout for connection attempt
        const connectionTimeout = setTimeout(() => {
          if (ws && ws.readyState === WebSocket.CONNECTING) {
            console.warn("WebSocket connection timeout - closing connection");
            ws.close();
          }
        }, 10000); // 10 second timeout

        ws.onopen = () => {
          console.log("🔔 Connected to notification service");
          setIsWebSocketConnected(true);
          reconnectAttempts = 0; // Reset on successful connection
          clearTimeout(connectionTimeout); // Clear connection timeout
        };

        ws.onmessage = (event) => {
          try {
            const notification = JSON.parse(event.data);
            console.log("📨 Received notification:", notification);

            addNotification({
              title: notification.title,
              message: notification.message,
              type: notification.type || "info",
              userId: notification.userId,
              appointmentId: notification.appointmentId,
              patientId: notification.patientId,
            });

            // Show toast notification
            switch (notification.type) {
              case "success":
                toast.success(notification.title, {
                  description: notification.message,
                });
                break;
              case "warning":
                toast.warning(notification.title, {
                  description: notification.message,
                });
                break;
              case "error":
                toast.error(notification.title, {
                  description: notification.message,
                });
                break;
              default:
                toast.info(notification.title, {
                  description: notification.message,
                });
            }
          } catch (error) {
            console.error("Error parsing notification:", error);
          }
        };

        ws.onclose = (event) => {
          console.log("🔔 Disconnected from notification service", {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          });
          setIsWebSocketConnected(false);
          clearTimeout(connectionTimeout); // Clear connection timeout

          // Only attempt to reconnect if it wasn't a clean close and we haven't exceeded max attempts
          if (
            !event.wasClean &&
            reconnectAttempts < maxReconnectAttempts &&
            user?.User_id
          ) {
            reconnectAttempts++;
            const delay = Math.min(
              1000 * Math.pow(2, reconnectAttempts),
              30000
            ); // Exponential backoff, max 30s

            console.log(
              `🔄 Attempting to reconnect to notification service... (attempt ${reconnectAttempts}/${maxReconnectAttempts}) in ${delay}ms`
            );

            reconnectTimeout = setTimeout(() => {
              connectWebSocket();
            }, delay);
          } else if (reconnectAttempts >= maxReconnectAttempts) {
            console.warn(
              "🚫 Max reconnection attempts reached. WebSocket notifications disabled."
            );
            console.info(
              "📝 Note: App will continue to work normally. Real-time notifications will not be available."
            );
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket connection error:", error);
          console.info(
            "📝 This is normal if the server doesn't support WebSocket notifications yet."
          );
          clearTimeout(connectionTimeout); // Clear connection timeout

          // Don't close here, let onclose handle reconnection
        };
      } catch (error) {
        console.error("Failed to create WebSocket connection:", error);
        console.info(
          "📝 WebSocket notifications are unavailable. App will continue to work normally."
        );
      }
    };

    // Initial connection attempt
    connectWebSocket();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws && ws.readyState !== WebSocket.CLOSED) {
        ws.close(1000, "Component unmounting"); // Clean close
      }
      setIsWebSocketConnected(false);
    };
  }, [user?.User_id]);

  // Fetch real notifications from backend
  useEffect(() => {
    if (!user?.User_id) return;

    const fetchRealNotifications = async () => {
      try {
        // Import the notification API
        const { notificationApi } = await import("../api/notifications");

        // Fetch user's actual notifications from backend
        const realNotifications = await notificationApi.findByUserId(
          user.User_id
        );

        console.log("Fetched notifications:", realNotifications);

        // Ensure realNotifications is an array
        if (!Array.isArray(realNotifications)) {
          console.warn("Expected notifications array, got:", realNotifications);
          setNotifications([]);
          return;
        }

        // Transform backend notifications to local format
        const transformedNotifications = realNotifications
          .filter((notif) => notif && notif.Notification_id) // Filter out null/undefined or invalid notifications
          .map((notif) => ({
            id: notif.Notification_id?.toString() || "unknown",
            title: notif.Title || "Notification",
            message: notif.Message || "",
            type:
              notif.Type === "general"
                ? ("info" as const)
                : notif.Type === "prescription"
                ? ("success" as const)
                : notif.Type === "appointment"
                ? ("info" as const)
                : notif.Type === "billing"
                ? ("warning" as const)
                : ("info" as const),
            timestamp: notif.Created_at
              ? new Date(notif.Created_at)
              : new Date(),
            read: notif.Status === "read",
            userId: notif.User_id || user.User_id,
          }));

        setNotifications(transformedNotifications);
      } catch (error) {
        console.error("Error fetching real notifications:", error);
        // Fallback to empty array if API fails
        setNotifications([]);
      }
    };

    fetchRealNotifications();

    // Set up periodic refresh for real notifications
    const interval = setInterval(fetchRealNotifications, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [user?.User_id]);

  const addNotification = async (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    // Add to local state immediately for responsiveness
    setNotifications((prev) => [newNotification, ...prev]);

    // Try to sync with backend
    try {
      if (user?.User_id) {
        const { notificationApi } = await import("../api/notifications");
        await notificationApi.create({
          User_id: user.User_id,
          Title: notification.title,
          Message: notification.message,
          Type:
            notification.type === "info"
              ? "general"
              : notification.type === "success"
              ? "prescription"
              : notification.type === "warning"
              ? "appointment"
              : "general",
          Status: "unread",
        });
      }
    } catch (error) {
      console.error("Error syncing notification with backend:", error);
      // Keep local notification even if backend sync fails
    }
  };

  const markAsRead = async (id: string) => {
    // Update local state immediately for responsiveness
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );

    // Try to sync with backend
    try {
      const { notificationApi } = await import("../api/notifications");
      const numericId = parseInt(id);
      if (!isNaN(numericId)) {
        await notificationApi.markAsRead(numericId);
      }
    } catch (error) {
      console.error("Error syncing read status with backend:", error);
      // Keep local change even if backend sync fails
    }
  };

  const markAllAsRead = async () => {
    // Update local state immediately for responsiveness
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));

    // Try to sync with backend
    try {
      if (user?.User_id) {
        const { notificationApi } = await import("../api/notifications");
        await notificationApi.markAllAsRead(user.User_id);
      }
    } catch (error) {
      console.error("Error syncing mark all read with backend:", error);
      // Keep local changes even if backend sync fails
    }
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isWebSocketConnected,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
