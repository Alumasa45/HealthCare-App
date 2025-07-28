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

  useEffect(() => {
    if (!user?.User_id) return;

    // Set up WebSocket connection for real-time notifications
    const ws = new WebSocket(
      `ws://localhost:3001/notifications?userId=${user.User_id}`
    );

    ws.onopen = () => {
      console.log("🔔 Connected to notification service");
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

    ws.onclose = () => {
      console.log("🔔 Disconnected from notification service");

      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (user?.User_id) {
          console.log("🔄 Attempting to reconnect to notification service...");
        }
      }, 5000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [user?.User_id]);

  // Simulate notifications for demonstration (remove in production)
  useEffect(() => {
    if (!user?.User_id || user.User_Type !== "Doctor") return;

    const simulateNotifications = () => {
      const sampleNotifications = [
        {
          title: "New Appointment",
          message:
            "Patient John Doe has booked an appointment for tomorrow at 2:00 PM",
          type: "info" as const,
        },
        {
          title: "Appointment Reminder",
          message: "You have an appointment with Jane Smith in 30 minutes",
          type: "warning" as const,
        },
        {
          title: "Lab Results Available",
          message: "Lab results for patient Mike Johnson are now available",
          type: "success" as const,
        },
      ];

      const interval = setInterval(() => {
        const randomNotification =
          sampleNotifications[
            Math.floor(Math.random() * sampleNotifications.length)
          ];
        addNotification(randomNotification);
      }, 30000);

      return () => clearInterval(interval);
    };

    const cleanup = simulateNotifications();
    return cleanup;
  }, [user?.User_id, user?.User_Type]);

  const addNotification = (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
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
