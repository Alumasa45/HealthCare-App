import apiClient from "./apiClient";
import { handleApiError } from "./errorUtils";

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerificationResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
    amount: number;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    metadata: any;
  };
}

export interface InitializePaymentDto {
  email: string;
  amount: number; // in kobo (KES * 100)
  reference?: string;
  callback_url?: string;
  metadata?: any;
}

export interface InitializeBillPaymentDto {
  patientEmail: string;
  callbackUrl?: string;
}

export const paymentApi = {
  initializePayment: async (
    data: InitializePaymentDto
  ): Promise<PaystackInitializeResponse> => {
    try {
      const response = await apiClient.post("/payment/initialize", data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  verifyPayment: async (
    reference: string
  ): Promise<PaystackVerificationResponse> => {
    try {
      const response = await apiClient.post(
        `/payment/verify?reference=${reference}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  verifyPaymentByReference: async (
    reference: string
  ): Promise<PaystackVerificationResponse> => {
    try {
      const response = await apiClient.get(`/payment/verify/${reference}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  initializeBillPayment: async (
    billId: number,
    data: InitializeBillPaymentDto
  ): Promise<PaystackInitializeResponse> => {
    try {
      const response = await apiClient.post(
        `/payment/bill/${billId}/initialize`,
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
