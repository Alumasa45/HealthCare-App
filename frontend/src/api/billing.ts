import { handleApiError } from "./errorUtils";
import type { Bill, CreateBillDto } from "./interfaces/billing";
import apiClient from "./apiClient";

export interface CalculateSessionBillDto {
  Patient_id: number;
  Appointment_id?: number;
  Consultation_Fee?: number;
  Medicine_Orders?: {
    Order_id: number;
    Total_Amount: number;
  }[];
  Prescription_ids?: number[];
  Additional_Description?: string;
}

export interface SessionBillCalculation {
  totalAmount: number;
  breakdown: {
    consultationFee: number;
    medicineOrdersTotal: number;
    prescriptionsTotal: number;
    taxAmount: number;
  };
  description: string;
}

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
      const url = Patient_id ? `/billing?patientId=${Patient_id}` : "/billing";
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

  calculateSessionBill: async (
    data: CalculateSessionBillDto
  ): Promise<SessionBillCalculation> => {
    try {
      const response = await apiClient.post(
        "/billing/calculate-session-bill",
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  createSessionBill: async (data: CalculateSessionBillDto): Promise<Bill> => {
    try {
      const response = await apiClient.post(
        "/billing/create-session-bill",
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
