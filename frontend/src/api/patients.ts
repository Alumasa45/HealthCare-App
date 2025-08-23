import apiClient from "./apiClient";
import { handleApiError } from "../utils/errorUtils";
import type { Patient } from "./interfaces/patient";

export type { Patient };

export const patientApi = {
  getAll: async (): Promise<Patient[]> => {
    try {
      const response = await apiClient.get("/patients");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getByUserId: async (userId: number): Promise<Patient> => {
    try {
      const response = await apiClient.get(`/api/patients/user/${userId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  update: async (
    patientId: number,
    patientData: Partial<Patient>
  ): Promise<Patient> => {
    try {
      const response = await apiClient.patch(
        `/api/patients/${patientId}`,
        patientData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  create: async (
    patientData: Omit<Patient, "Patient_id">
  ): Promise<Patient> => {
    try {
      const response = await apiClient.post("/api/patients", patientData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
