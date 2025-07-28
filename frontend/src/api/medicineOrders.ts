import { handleApiError } from "./errorUtils";
import type {
  MedicineOrder,
  CreateMedicineOrderDto,
} from "./interfaces/orders";
import apiClient from "./apiClient";

export const medicineOrderApi = {
  create: async (orderData: CreateMedicineOrderDto) => {
    try {
      const response = await apiClient.post("/medicine-orders", orderData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findAll: async (): Promise<MedicineOrder[]> => {
    try {
      const response = await apiClient.get("/medicine-orders");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findByPharmacy: async (pharmacyId: number): Promise<MedicineOrder[]> => {
    try {
      const response = await apiClient.get(
        `/medicine-orders/pharmacy/${pharmacyId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findOne: async (orderId: string): Promise<MedicineOrder | null> => {
    try {
      const response = await apiClient.get(`/medicine-orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findByPatient: async (patientId: number): Promise<MedicineOrder[]> => {
    try {
      const response = await apiClient.get(
        `/medicine-orders/patient/${patientId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  update: async (
    orderId: string,
    orderData: Partial<MedicineOrder>
  ): Promise<MedicineOrder | null> => {
    try {
      const response = await apiClient.patch(
        `/medicine-orders/${orderId}`,
        orderData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  delete: async (orderId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/medicine-orders/${orderId}`);
      return true;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateStatus: async (
    orderId: string,
    status: string
  ): Promise<MedicineOrder | null> => {
    try {
      const response = await apiClient.patch(
        `/medicine-orders/${orderId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
