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
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findByUserId: async (userId: number): Promise<Notification[]> => {
    try {
      const response = await apiClient.get(`/notifications?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findOne: async (id: number): Promise<Notification> => {
    try {
      const response = await apiClient.get(`/notifications/${id}`);
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
      const response = await apiClient.patch(`/notifications/${id}`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  markAsRead: async (id: number): Promise<Notification> => {
    try {
      const response = await apiClient.patch(`/notifications/${id}/mark-read`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  markAllAsRead: async (userId: number): Promise<void> => {
    try {
      await apiClient.patch(`/notifications/mark-all-read/${userId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getUnreadCount: async (userId: number): Promise<number> => {
    try {
      const response = await apiClient.get(
        `/notifications/unread-count/${userId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/notifications/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
