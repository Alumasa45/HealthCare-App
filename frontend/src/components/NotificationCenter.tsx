import React, { useState, useEffect } from "react";
import {
  Bell,
  X,
  Check,
  Pill,
  Calendar,
  CreditCard,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { notificationApi } from "@/api/notifications";
import type { Notification } from "@/api/interfaces/notification";
import { useAuth } from "@/contexts/AuthContext";

export const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.User_id) {
      fetchNotifications();
      fetchUnreadCount();

      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications();
        fetchUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user?.User_id]);

  const fetchNotifications = async () => {
    if (!user?.User_id) return;

    try {
      const data = await notificationApi.findByUserId(user.User_id);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user?.User_id) return;

    try {
      const count = await notificationApi.getUnreadCount(user.User_id);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await notificationApi.markAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.Notification_id === notificationId
            ? { ...notif, Status: "read" }
            : notif
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    if (!user?.User_id) return;

    try {
      setLoading(true);
      await notificationApi.markAllAsRead(user.User_id);

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, Status: "read" as const }))
      );

      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "prescription":
        return <Pill className="h-4 w-4 text-purple-600" />;
      case "appointment":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case "billing":
        return <CreditCard className="h-4 w-4 text-green-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50 max-h-96">
          <div className="p-4 border-b bg-gray-50 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    disabled={loading}
                    className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  You'll see updates about your prescriptions, appointments, and
                  more here
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.Notification_id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                    notification.Status === "unread"
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : "border-l-4 border-l-transparent"
                  }`}
                  onClick={() => markAsRead(notification.Notification_id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.Type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4
                          className={`text-sm font-medium text-gray-900 ${
                            notification.Status === "unread"
                              ? "font-semibold"
                              : ""
                          }`}
                        >
                          {notification.Title}
                        </h4>
                        {notification.Status === "unread" && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.Message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(notification.Created_at)}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            notification.Type === "prescription"
                              ? "bg-purple-100 text-purple-700"
                              : notification.Type === "appointment"
                              ? "bg-blue-100 text-blue-700"
                              : notification.Type === "billing"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {notification.Type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-b-lg border-t">
              <button
                onClick={() => {
                  setShowNotifications(false);
                  // Navigate to notifications page if you have one
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
