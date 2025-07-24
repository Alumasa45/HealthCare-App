import apiClient from "./apiClient";
import type { DoctorInfo } from "./interfaces/doctor";
import type { LoginResponse, Doctors } from "./interfaces/doctor";
import {
  handleApiError,
  createErrorMessage,
  isApiError,
} from "../utils/errorUtils";

export const doctorApi = {
  create: async (doctorData: DoctorInfo): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>(
        "/doctors",
        doctorData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  login: async (credentials: {
    License_number: string;
  }): Promise<LoginResponse> => {
    try {
      console.log("Sending login request with:", credentials);
      const response = await apiClient.post<LoginResponse>("/doctors/login", {
        License_number: credentials.License_number,
      });
      return response.data;
    } catch (error) {
      console.error("Login error details:", error);
      throw handleApiError(error);
    }
  },

  getAll: async (): Promise<Doctors[]> => {
    try {
      const response = await apiClient.get<Doctors[]>("/doctors");
      return response.data;
    } catch (error) {
      throw new Error(createErrorMessage("Failed to fetch doctors", error));
    }
  },

  getById: async (Doctor_id: string): Promise<Doctors> => {
    try {
      const response = await apiClient.get<Doctors>(`/doctors/${Doctor_id}`);
      return response.data;
    } catch (error) {
      if (isApiError(error) && Number(error.response?.status) === 404) {
        throw new Error(`Doctor with ID ${Doctor_id} not found`);
      }
      throw new Error(createErrorMessage("Failed to fetch doctor", error));
    }
  },

  findByUserId: async (User_id: number): Promise<Doctors> => {
    try {
      const response = await apiClient.get<Doctors[]>("/doctors");
      const doctors = response.data;
      const doctor = doctors.find((doc) => doc.User_id === User_id);
      if (!doctor) {
        throw new Error(`Doctor with User_id ${User_id} not found`);
      }
      return doctor;
    } catch (error) {
      throw new Error(
        createErrorMessage("Failed to fetch doctor by User_id", error)
      );
    }
  },

  update: async (
    Doctor_id: string,
    doctorData: Partial<Doctors>
  ): Promise<Doctors> => {
    try {
      const response = await apiClient.patch<Doctors>(
        `/doctors/${Doctor_id}`,
        doctorData
      );
      return response.data;
    } catch (error) {
      throw new Error(createErrorMessage("Failed to update doctor", error));
    }
  },

  delete: async (Doctor_id: string): Promise<void> => {
    try {
      await apiClient.delete(`/doctors/${Doctor_id}`);
    } catch (error) {
      throw new Error(createErrorMessage("Failed to delete doctor", error));
    }
  },
};
