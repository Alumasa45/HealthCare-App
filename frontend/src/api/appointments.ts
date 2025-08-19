import type { Appointment, AppointmentInfo } from "./interfaces/appointment";
import apiClient from "./apiClient";
import { handleApiError } from "./errorUtils";

export const appointmentApi = {
  register: async (appointmentData: AppointmentInfo): Promise<Appointment> => {
    try {
      const response = await apiClient.post("/appointments", appointmentData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getAll: async (): Promise<Appointment[]> => {
    try {
      const response = await apiClient.get("/appointments");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getByDoctorId: async (Doctor_id: number): Promise<Appointment[]> => {
    try {
      const response = await apiClient.get(`/appointments/doctor/${Doctor_id}`);
      const data = response.data;
      console.log("Appointments for doctor:", data);
      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getByPatientId: async (Patient_id: number): Promise<Appointment[]> => {
    try {
      const response = await apiClient.get(
        `/appointments/patient/${Patient_id}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getByUserId: async (User_id: number): Promise<Appointment[]> => {
    try {
      const response = await apiClient.get(`/appointments/user/${User_id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getById: async (Appointment_id: number): Promise<Appointment> => {
    try {
      const response = await apiClient.get(`/appointments/${Appointment_id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  update: async (
    Appointment_id: number,
    appointmentData: Partial<AppointmentInfo>
  ): Promise<Appointment> => {
    try {
      const response = await apiClient.patch(
        `/appointments/${Appointment_id}`,
        appointmentData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  delete: async (Appointment_id: number): Promise<void> => {
    try {
      await apiClient.delete(`/appointments/${Appointment_id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
