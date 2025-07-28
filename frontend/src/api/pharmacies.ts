import { handleApiError } from "./errorUtils";
import apiClient from "./apiClient";

export interface Pharmacy {
  Pharmacy_id: number;
  User_id: number;
  Pharmacy_Name: string;
  License_Number: string;
  Phone_Number: string;
  Email: string;
  Opening_Time: string;
  Closing_Time: string;
  Delivery_Available: boolean;
  Is_Verified: boolean;
  Rating: number;
  Address?: string;
  Created_at?: Date | string;
  Updated_at?: Date | string;
}

export interface CreatePharmacyDto {
  User_id: number;
  Pharmacy_Name: string;
  License_Number: string;
  Phone_Number: string;
  Email: string;
  Opening_Time: string;
  Closing_Time: string;
  Delivery_Available: boolean;
  Is_Verified?: boolean;
  Rating?: number;
}

export const pharmacyApi = {
  create: async (pharmacyData: CreatePharmacyDto) => {
    try {
      console.log("Creating new pharmacy:", pharmacyData);
      const response = await apiClient.post("/pharmacies", pharmacyData);
      console.log("Pharmacy created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating pharmacy:", error);
      throw handleApiError(error);
    }
  },

  findAll: async (): Promise<Pharmacy[]> => {
    try {
      console.log("Fetching all pharmacies...");
      const response = await apiClient.get("/pharmacies");
      console.log("Pharmacies fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching pharmacies:", error);
      throw handleApiError(error);
    }
  },

  findOne: async (pharmacyId: string): Promise<Pharmacy | null> => {
    try {
      console.log(`Fetching pharmacy with ID: ${pharmacyId}`);
      const response = await apiClient.get(`/pharmacies/${pharmacyId}`);
      console.log("Pharmacy fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching pharmacy ${pharmacyId}:`, error);
      throw handleApiError(error);
    }
  },

  findByUserId: async (userId: number): Promise<Pharmacy | null> => {
    try {
      console.log(`Fetching pharmacy for user ID: ${userId}`);
      const response = await apiClient.get(`/pharmacies/user/${userId}`);
      console.log("Pharmacy fetched for user:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching pharmacy for user ${userId}:`, error);
      throw handleApiError(error);
    }
  },

  update: async (
    pharmacyId: string,
    pharmacyData: Partial<Pharmacy>
  ): Promise<Pharmacy | null> => {
    try {
      console.log(`Updating pharmacy ${pharmacyId}:`, pharmacyData);
      const response = await apiClient.patch(
        `/pharmacies/${pharmacyId}`,
        pharmacyData
      );
      console.log("Pharmacy updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating pharmacy ${pharmacyId}:`, error);
      throw handleApiError(error);
    }
  },

  delete: async (pharmacyId: string): Promise<void> => {
    try {
      console.log(`Deleting pharmacy with ID: ${pharmacyId}`);
      await apiClient.delete(`/pharmacies/${pharmacyId}`);
      console.log("Pharmacy deleted successfully");
    } catch (error) {
      console.error(`Error deleting pharmacy ${pharmacyId}:`, error);
      throw handleApiError(error);
    }
  },
};
