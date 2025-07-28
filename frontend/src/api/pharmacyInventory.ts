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
      console.log("Creating new pharmacy inventory:", inventoryData);
      const response = await apiClient.post(
        "/pharmacy-inventory",
        inventoryData
      );
      console.log("Pharmacy inventory created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating pharmacy inventory:", error);
      throw handleApiError(error);
    }
  },

  findAll: async (): Promise<PharmacyInventory[]> => {
    try {
      console.log("Fetching all pharmacy inventory...");
      const response = await apiClient.get("/pharmacy-inventory");
      console.log("All pharmacy inventory fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching all pharmacy inventory:", error);
      throw handleApiError(error);
    }
  },

  findByPharmacy: async (pharmacyId: number): Promise<PharmacyInventory[]> => {
    try {
      console.log(`Fetching inventory for pharmacy ID: ${pharmacyId}`);
      const response = await apiClient.get(
        `/pharmacy-inventory/pharmacy/${pharmacyId}`
      );
      console.log(
        `Inventory fetched for pharmacy ${pharmacyId}:`,
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching inventory for pharmacy ${pharmacyId}:`,
        error
      );
      throw handleApiError(error);
    }
  },

  findOne: async (Inventory_id: string): Promise<PharmacyInventory | null> => {
    try {
      console.log(`Fetching inventory item with ID: ${Inventory_id}`);
      const response = await apiClient.get(
        `/pharmacy-inventory/${Inventory_id}`
      );
      console.log("Inventory item fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching inventory item ${Inventory_id}:`, error);
      throw handleApiError(error);
    }
  },

  update: async (
    Inventory_id: string,
    inventoryData: UpdatePharmacyInventoryDto
  ): Promise<PharmacyInventory | null> => {
    try {
      console.log(`Updating inventory item ${Inventory_id}:`, inventoryData);
      const response = await apiClient.patch(
        `/pharmacy-inventory/${Inventory_id}`,
        inventoryData
      );
      console.log("Inventory item updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating inventory item ${Inventory_id}:`, error);
      throw handleApiError(error);
    }
  },

  delete: async (Inventory_id: string): Promise<boolean> => {
    try {
      console.log(`Deleting inventory item with ID: ${Inventory_id}`);
      await apiClient.delete(`/pharmacy-inventory/${Inventory_id}`);
      console.log("Inventory item deleted successfully");
      return true;
    } catch (error) {
      console.error(`Error deleting inventory item ${Inventory_id}:`, error);
      throw handleApiError(error);
    }
  },
};
