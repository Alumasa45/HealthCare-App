import type {
  Notification,
  CreateNotificationRequest,
} from "./interfaces/notification";
import apiClient from "./apiClient";
import { handleApiError } from "./errorUtils";

export const notificationApi = {
  create: async (
    notificationData: CreateNotificationRequest
  ): Promise<Notification> => {
    try {
      const response = await apiClient.post("/notifications", notificationData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findAll: async (): Promise<Notification[]> => {
    try {
      const response = await apiClient.get("/notifications");

      // Handle different response structures
      let data = response.data;

      // If the response has a data property, use that
      if (data && typeof data === "object" && "data" in data) {
        data = data.data;
      }

      // Ensure we return an array
      if (!Array.isArray(data)) {
        console.warn("Expected array from notifications API, got:", data);
        return [];
      }

      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findByUserId: async (userId: number): Promise<Notification[]> => {
    try {
      const response = await apiClient.get(
        `/api/notifications?userId=${userId}`
      );

      // Handle different response structures
      let data = response.data;

      // If the response has a data property, use that
      if (data && typeof data === "object" && "data" in data) {
        data = data.data;
      }

      // Ensure we return an array
      if (!Array.isArray(data)) {
        console.warn("Expected array from notifications API, got:", data);
        return [];
      }

      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findOne: async (id: number): Promise<Notification> => {
    try {
      const response = await apiClient.get(`/api/notifications/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  update: async (
    id: number,
    data: Partial<Notification>
  ): Promise<Notification> => {
    try {
      const response = await apiClient.patch(`/api/notifications/${id}`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  markAsRead: async (id: number): Promise<Notification> => {
    try {
      const response = await apiClient.patch(
        `/api/notifications/${id}/mark-read`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  markAllAsRead: async (userId: number): Promise<void> => {
    try {
      await apiClient.patch(`/api/notifications/mark-all-read/${userId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getUnreadCount: async (userId: number): Promise<number> => {
    try {
      const response = await apiClient.get(
        `/api/notifications/unread-count/${userId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/api/notifications/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
