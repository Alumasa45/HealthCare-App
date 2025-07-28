import type { MedicalRecords } from "./interfaces/record";
import apiClient from "./apiClient";
import { handleApiError } from "./errorUtils";

export const recordsApi = {
  create: async (recordData: MedicalRecords): Promise<MedicalRecords> => {
    try {
      const response = await apiClient.post("/medical-records", recordData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findAll: async (): Promise<MedicalRecords[]> => {
    try {
      const response = await apiClient.get("/medical-records");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findOne: async (Record_id: string): Promise<MedicalRecords | null> => {
    try {
      const response = await apiClient.get(`/medical-records/${Record_id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching medical record:", error);
      return null;
    }
  },

  update: async (
    Record_id: string,
    recordData: Partial<MedicalRecords>
  ): Promise<MedicalRecords | null> => {
    try {
      const response = await apiClient.patch(
        `/medical-records/${Record_id}`,
        recordData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  delete: async (Record_id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/medical-records/${Record_id}`);
      return true;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findByPatientId: async (patientId: number): Promise<MedicalRecords[]> => {
    try {
      const response = await apiClient.get(
        `/medical-records?patientId=${patientId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findByDoctorId: async (doctorId: number): Promise<MedicalRecords[]> => {
    try {
      const response = await apiClient.get(
        `/medical-records?doctorId=${doctorId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
