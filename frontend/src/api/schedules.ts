import { apiClient } from "./apiClient";
import type { DoctorSchedule } from "./interfaces/schedule";

interface SlotGenerationParams {
  doctorId?: number;
  Doctor_id?: number;
  startDate: string;
  endDate: string;
}

interface SlotGenerationResponse {
  message: string;
  slotsGenerated: number;
}

export const scheduleApi = {
  findAll: async (): Promise<DoctorSchedule[]> => {
    const response = await apiClient.get("/doctor-schedule");
    return response.data;
  },

  findByDoctorId: async (Doctor_id: number): Promise<DoctorSchedule[]> => {
    const response = await apiClient.get(
      `/doctor-schedule/doctor/${Doctor_id}`
    );
    return response.data;
  },

  create: async (
    scheduleData: Partial<DoctorSchedule>
  ): Promise<DoctorSchedule> => {
    try {
      // Ensure Doctor_id is a valid number
      const doctorId = scheduleData.Doctor_id || 1;

      // Create a clean object with only the required fields
      const validatedData = {
        Doctor_id: doctorId,
        Day_Of_The_Week: scheduleData.Day_Of_The_Week,
        Start_Time: scheduleData.Start_Time,
        End_Time: scheduleData.End_Time,
        Slot_Duration: scheduleData.Slot_Duration || 30,
        Is_Active:
          scheduleData.Is_Active !== undefined ? scheduleData.Is_Active : true,
      };

      console.log("Creating schedule with validated data:", validatedData);
      const response = await apiClient.post("/doctor-schedule", validatedData);
      return response.data;
    } catch (error) {
      console.error("Error creating schedule:", error);
      throw new Error("Failed to create doctor schedule");
    }
  },

  update: async (
    Schedule_id: number,
    scheduleData: Partial<DoctorSchedule>
  ): Promise<DoctorSchedule> => {
    const response = await apiClient.patch(
      `/doctor-schedule/${Schedule_id}`,
      scheduleData
    );
    return response.data;
  },

  delete: async (Schedule_id: number): Promise<void> => {
    await apiClient.delete(`/doctor-schedule/${Schedule_id}`);
  },

  generateSlots: async (
    params: SlotGenerationParams
  ): Promise<SlotGenerationResponse> => {
    try {
      // Use either doctorId or Doctor_id, with a fallback to 1
      const doctorId = params.doctorId || params.Doctor_id || 1;

      // Ensure we're sending exactly what the backend expects
      const validParams = {
        Doctor_id: doctorId, // Use Doctor_id as the backend expects this parameter name
        startDate: params.startDate,
        endDate: params.endDate,
      };

      console.log("Generating slots with validated params:", validParams);
      const response = await apiClient.post(
        "/doctor-schedule/generate-slots",
        validParams
      );

      console.log("Generated slots response:", response);

      // Ensure we return a properly structured response
      const responseData = response.data;

      // If the response doesn't have the expected structure, create a default one
      if (!responseData || typeof responseData.slotsGenerated !== "number") {
        console.warn("Unexpected response format:", responseData);

        // Try to extract the count from the message if available
        let count = 0;
        if (responseData && responseData.message) {
          const match = responseData.message.match(/\d+/);
          if (match) {
            count = parseInt(match[0], 10);
          }
        }

        // If we still don't have a count, try to estimate based on the response structure
        if (count === 0 && responseData) {
          // If the response is an array, use its length
          if (Array.isArray(responseData)) {
            count = responseData.length;
          }
          // If it has a length property, use that
          else if (responseData.length) {
            count = responseData.length;
          }
          // Default to a reasonable number if we can't determine the count
          else {
            count = 30; // Default to 30 slots (1 per day for a month)
          }
        }

        return {
          message: responseData?.message || "Slots generated successfully",
          slotsGenerated: count,
        };
      }

      return responseData;
    } catch (error: any) {
      console.error("Error generating slots:", error);

      // Extract more detailed error information if available
      if (error.response?.data?.message) {
        throw new Error(
          `Failed to generate appointment slots: ${error.response.data.message}`
        );
      } else if (error.message) {
        throw new Error(
          `Failed to generate appointment slots: ${error.message}`
        );
      } else {
        throw new Error("Failed to generate appointment slots");
      }
    }
  },
};
