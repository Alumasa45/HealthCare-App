import React, { useState, useEffect } from "react";
import { notificationApi } from "@/api/notifications";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Send, Trash2 } from "lucide-react";
import type { Notification } from "@/api/interfaces/notification";

const NotificationTester: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "general" as "prescription" | "appointment" | "billing" | "general",
  });

  const fetchNotifications = async () => {
    if (!user?.User_id) return;

    try {
      setLoading(true);
      const data = await notificationApi.findByUserId(user.User_id);
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const createTestNotification = async () => {
    if (!user?.User_id || !newNotification.title || !newNotification.message) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const notificationData = {
        User_id: user.User_id,
        Title: newNotification.title,
        Message: newNotification.message,
        Type: newNotification.type,
        Status: "unread" as const,
      };

      await notificationApi.create(notificationData);
      toast.success("Test notification created!");

      // Reset form
      setNewNotification({
        title: "",
        message: "",
        type: "general",
      });

      // Refresh notifications
      await fetchNotifications();
    } catch (error) {
      console.error("Error creating notification:", error);
      toast.error("Failed to create notification");
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await notificationApi.update(notificationId, { Status: "read" });
      toast.success("Notification marked as read");
      await fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark as read");
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      await notificationApi.delete(notificationId);
      toast.success("Notification deleted");
      await fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "prescription":
        return "bg-green-100 text-green-800";
      case "appointment":
        return "bg-blue-100 text-blue-800";
      case "billing":
        return "bg-yellow-100 text-yellow-800";
      case "general":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-center text-gray-600">
          Please log in to test notifications
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Notification Tester</h1>
      </div>

      {/* Create Test Notification */}
      <Card>
        <CardHeader>
          <CardTitle>Create Test Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              value={newNotification.title}
              onChange={(e) =>
                setNewNotification((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              placeholder="Notification title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <Textarea
              value={newNotification.message}
              onChange={(e) =>
                setNewNotification((prev) => ({
                  ...prev,
                  message: e.target.value,
                }))
              }
              placeholder="Notification message"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={newNotification.type}
              onChange={(e) =>
                setNewNotification((prev) => ({
                  ...prev,
                  type: e.target.value as any,
                }))
              }
              className="w-full p-2 border rounded-md"
            >
              <option value="general">General</option>
              <option value="appointment">Appointment</option>
              <option value="prescription">Prescription</option>
              <option value="billing">Billing</option>
            </select>
          </div>

          <Button onClick={createTestNotification} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Create Test Notification
          </Button>
        </CardContent>
      </Card>

      {/* Display Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Your Notifications
            <Button
              variant="outline"
              size="sm"
              onClick={fetchNotifications}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              No notifications found
            </p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.Notification_id}
                  className={`p-4 border rounded-lg ${
                    notification.Status === "read"
                      ? "bg-gray-50"
                      : "bg-white border-blue-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3
                          className={`font-medium ${
                            notification.Status === "read"
                              ? "text-gray-600"
                              : "text-gray-900"
                          }`}
                        >
                          {notification.Title}
                        </h3>
                        <Badge className={getTypeColor(notification.Type)}>
                          {notification.Type}
                        </Badge>
                        {notification.Status === "unread" && (
                          <Badge variant="outline" className="text-blue-600">
                            New
                          </Badge>
                        )}
                      </div>
                      <p
                        className={`text-sm ${
                          notification.Status === "read"
                            ? "text-gray-500"
                            : "text-gray-700"
                        }`}
                      >
                        {notification.Message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.Created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {notification.Status === "unread" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            markAsRead(notification.Notification_id)
                          }
                        >
                          Mark Read
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          deleteNotification(notification.Notification_id)
                        }
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Testing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <h4 className="font-medium">How to test notifications:</h4>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              <li>Create test notifications using the form above</li>
              <li>Check if they appear in the list below</li>
              <li>Test marking notifications as read</li>
              <li>Test deleting notifications</li>
              <li>Refresh to see if data persists</li>
            </ol>

            <h4 className="font-medium mt-4">
              Backend endpoints being tested:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>
                <code>POST /notifications</code> - Create notification
              </li>
              <li>
                <code>GET /notifications?userId={"${user.User_id}"}</code> - Get
                user notifications
              </li>
              <li>
                <code>PUT /notifications/{"${id}"}</code> - Update notification
              </li>
              <li>
                <code>DELETE /notifications/{"${id}"}</code> - Delete
                notification
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationTester;
