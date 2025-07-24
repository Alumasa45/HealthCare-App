import { handleApiError } from "./errorUtils";
import type {
  PharmacyInventory,
  CreatePharmacyInventoryDto,
  UpdatePharmacyInventoryDto,
} from "./interfaces/pharmacyInventory";
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

  findOne: async (Inventory_id: string): Promise<PharmacyInventory | null> => {
    try {
      const response = await apiClient.get(
        `/pharmacy-inventory/${Inventory_id}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  update: async (
    Inventory_id: string,
    inventoryData: UpdatePharmacyInventoryDto
  ): Promise<PharmacyInventory | null> => {
    try {
      const response = await apiClient.patch(
        `/pharmacy-inventory/${Inventory_id}`,
        inventoryData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  delete: async (Inventory_id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/pharmacy-inventory/${Inventory_id}`);
      return true;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
