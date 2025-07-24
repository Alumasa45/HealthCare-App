import { handleApiError } from "./errorUtils";
import type { Medicine, CreateMedicineDto } from "./interfaces/medicine";
import apiClient from "./apiClient";

export const medicineApi = {
  create: async (medicineData: CreateMedicineDto) => {
    try {
      const response = await apiClient.post("/medicines", medicineData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findAll: async () => {
    try {
      const response = await apiClient.get("/medicines");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findOne: async (Medicine_id: string): Promise<Medicine | null> => {
    try {
      const response = await apiClient.get(`/medicines/${Medicine_id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  update: async (
    Medicine_id: string,
    medicineData: Partial<Medicine>
  ): Promise<Medicine | null> => {
    try {
      const response = await apiClient.patch(
        `/medicines/${Medicine_id}`,
        medicineData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  delete: async (Medicine_id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/medicines/${Medicine_id}`);
      return true;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
