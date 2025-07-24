import { handleApiError } from "./errorUtils";
import type {
  PharmacyInventory,
  CreatePharmacyInventoryDto,
} from "./interfaces/pharmacy";
import apiClient from "./apiClient";

export const pharmacyInventoryApi = {
  create: async (inventoryData: CreatePharmacyInventoryDto) => {
    try {
      const response = await apiClient.post(
        "/pharmacy-inventory",
        inventoryData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findAll: async (): Promise<PharmacyInventory[]> => {
    try {
      const response = await apiClient.get("/pharmacy-inventory");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findOne: async (inventoryId: string): Promise<PharmacyInventory | null> => {
    try {
      const response = await apiClient.get(
        `/pharmacy-inventory/${inventoryId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  update: async (
    inventoryId: string,
    inventoryData: Partial<PharmacyInventory>
  ): Promise<PharmacyInventory | null> => {
    try {
      const response = await apiClient.patch(
        `/pharmacy-inventory/${inventoryId}`,
        inventoryData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  delete: async (inventoryId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/pharmacy-inventory/${inventoryId}`);
      return true;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Filter methods for pharmacy page
  findByCategory: async (category: string): Promise<PharmacyInventory[]> => {
    try {
      const response = await apiClient.get(
        `/pharmacy-inventory?category=${category}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findByPriceRange: async (
    minPrice: number,
    maxPrice: number
  ): Promise<PharmacyInventory[]> => {
    try {
      const response = await apiClient.get(
        `/pharmacy-inventory?minPrice=${minPrice}&maxPrice=${maxPrice}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  searchMedicines: async (searchTerm: string): Promise<PharmacyInventory[]> => {
    try {
      const response = await apiClient.get(
        `/pharmacy-inventory?search=${searchTerm}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
