import { handleApiError } from "./errorUtils";
import apiClient from "./apiClient";
import type { Slots } from "./interfaces/appointmentSlot";

export const slotApi = {
  create: async (slotsData: Slots) => {
    try {
      const response = await apiClient.post("/appointment-slots", slotsData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findAll: async (): Promise<Slots[]> => {
    try {
      const response = await apiClient.get("/appointment-slots");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  findByDoctorAndDate: async (
    Doctor_id: number,
    date: string
  ): Promise<Slots[]> => {
    try {
      console.log(`Fetching slots for doctor ${Doctor_id} on date ${date}`);
      const response = await apiClient.get("/appointment-slots", {
        params: {
          Doctor_id: Doctor_id.toString(),
          date: date,
        },
      });
      console.log("Slots response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching slots by doctor and date:", error);
      throw handleApiError(error);
    }
  },

  findOne: async (Slot_id: number): Promise<Slots | null> => {
    try {
      const response = await apiClient.get(`/appointment-slots/${Slot_id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  update: async (
    Slot_id: number,
    prescriptionData: Partial<Slots>
  ): Promise<Slots | null> => {
    try {
      const response = await apiClient.patch(
        `/appointment-slots/${Slot_id}`,
        prescriptionData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  delete: async (Slot_id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/appointment-slots/${Slot_id}`);
      return true;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
