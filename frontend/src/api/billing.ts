import { handleApiError } from "./errorUtils";
import type { Bill, CreateBillDto } from "./interfaces/billing";
import apiClient from "./apiClient";

export const billingApi = {
  create: async (billData: CreateBillDto) => {
    try {
      const response = await apiClient.post("/billing", billData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findAll: async (Patient_id?: number): Promise<Bill[]> => {
    try {
      const url = Patient_id ? `/billing?Patient_id=${Patient_id}` : "/billing";
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findOne: async (billId: string): Promise<Bill | null> => {
    try {
      const response = await apiClient.get(`/billing/${billId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  payBill: async (
    billId: string,
    paymentMethod: string
  ): Promise<Bill | null> => {
    try {
      const response = await apiClient.patch(`/billing/${billId}/pay`, {
        Payment_Method: paymentMethod,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
