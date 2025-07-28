import { createErrorMessage, handleApiError, isApiError } from "./errorUtils";
import apiClient from "./apiClient";
import type { Pharmacist, PharmLoginResponse } from "./interfaces/pharmacist";

export const pharmacistApi = {
  create: async (pharmacistData: Pharmacist): Promise<PharmLoginResponse> => {
    try {
      const response = await apiClient.post<PharmLoginResponse>(
        "/pharmacies",
        pharmacistData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  login: async (credentials: {
    License_Number: string;
  }): Promise<PharmLoginResponse> => {
    try {
      console.log("Sending login request with:", credentials);
      const response = await apiClient.post<PharmLoginResponse>(
        "/pharmacies/login",
        { License_Number: credentials.License_Number }
      );
      return response.data;
    } catch (error) {
      console.error("Login error details:", error);
      throw handleApiError(error);
    }
  },

  getAll: async (): Promise<Pharmacist[]> => {
    try {
      const response = await apiClient.get<Pharmacist[]>("/pharmacies");
      return response.data;
    } catch (error) {
      throw createErrorMessage("Failed to fetch pharmacies.");
    }
  },

  getById: async (Pharmacist_id: string): Promise<Pharmacist> => {
    try {
      const response = await apiClient.get<Pharmacist>(
        `/pharmacies/${Pharmacist_id}`
      );
      return response.data;
    } catch (error) {
      if (isApiError(error) && (error as any).response?.status === 404) {
        throw new Error(`Pharmacy with ID ${Pharmacist_id} not found`);
      }
      throw createErrorMessage("Failed to fetch pharmacy");
    }
  },

  getByUserId: async (userId: number): Promise<Pharmacist> => {
    try {
      const response = await apiClient.get<Pharmacist>(
        `/pharmacies/user/${userId}`
      );
      return response.data;
    } catch (error) {
      if (isApiError(error) && (error as any).response?.status === 404) {
        throw new Error(`Pharmacy for user ID ${userId} not found`);
      }
      throw createErrorMessage("Failed to fetch pharmacy for user");
    }
  },

  update: async (
    Pharmacist_id: string,
    pharmacistData: Partial<Pharmacist>
  ): Promise<Pharmacist> => {
    try {
      const response = await apiClient.patch<Pharmacist>(
        `/pharmacies/${Pharmacist_id}`,
        pharmacistData
      );
      return response.data;
    } catch (error) {
      throw createErrorMessage("Failed to update pharmacy.");
    }
  },

  delete: async (Pharmacist_id: string): Promise<void> => {
    try {
      await apiClient.delete(`/pharmacies/${Pharmacist_id}`);
    } catch (error) {
      throw createErrorMessage("Failed to delete pharmacy.");
    }
  },
};
