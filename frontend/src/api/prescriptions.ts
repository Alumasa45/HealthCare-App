import type { Prescription } from "./interfaces/prescription";
import apiClient from "./apiClient";
import { handleApiError } from "./errorUtils";

export const prescriptionapi = {
  create: async (prescriptionData: Prescription) => {
    try {
      const response = await apiClient.post("/prescriptions", prescriptionData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findAll: async (): Promise<Prescription[]> => {
    try {
      const response = await apiClient.get("/prescriptions");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findByPatientId: async (patientId: number): Promise<Prescription[]> => {
    try {
      const response = await apiClient.get(
        `/api/prescriptions/patient/${patientId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findOne: async (Prescription_id: string): Promise<Prescription | null> => {
    try {
      const response = await apiClient.get(
        `/api/prescriptions/${Prescription_id}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  update: async (
    Prescription_id: string,
    prescriptionData: Partial<Prescription>
  ): Promise<Prescription | null> => {
    try {
      const response = await apiClient.patch(
        `/api/prescriptions/${Prescription_id}`,
        prescriptionData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  delete: async (Prescription_id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/api/prescriptions/${Prescription_id}`);
      return true;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
