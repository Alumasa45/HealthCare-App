import { createFileRoute, redirect } from "@tanstack/react-router";
import NotificationTester from "@/components/NotificationTester";

export const Route = createFileRoute("/admin/notifications")({
  component: NotificationTester,
  beforeLoad: async () => {
    const authToken = localStorage.getItem("authToken");
    const userData = localStorage.getItem("currentUser");

    if (!authToken || !userData) {
      throw redirect({
        to: "/login",
        replace: true,
      });
    }

    try {
      const user = JSON.parse(userData);
      // Allow any user type to test notifications
      return { user };
    } catch (error) {
      throw redirect({
        to: "/login",
        replace: true,
      });
    }
  },
});
