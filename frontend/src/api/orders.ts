import { handleApiError } from "./errorUtils";
import type { Order } from "./interfaces/Order";
import apiClient from "./apiClient";

export const orderApi = {
  create: async (orderData: Order) => {
    try {
      const response = await apiClient.post("/medicine-orders", orderData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findAll: async (): Promise<Order[]> => {
    try {
      const response = await apiClient.get("/medicine-orders");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findByPatient: async (Patient_id: number): Promise<Order[]> => {
    try {
      const response = await apiClient.get(
        `/medicine-orders/patient/${Patient_id}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findOne: async (Order_id: string): Promise<Order | null> => {
    try {
      const response = await apiClient.get(`/medicine-orders/${Order_id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  update: async (
    Order_id: string,
    orderData: Partial<Order>
  ): Promise<Order | null> => {
    try {
      const response = await apiClient.patch(
        `/medicine-orders/${Order_id}`,
        orderData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  delete: async (Order_id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/medicine-orders/${Order_id}`);
      return true;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
