import apiClient from "./apiClient";
import { handleApiError, createErrorMessage } from "../utils/errorUtils";

export interface Patient {
  Patient_id?: number;
  User_id: number;
  Medical_History?: string;
  Allergies?: string;
  Blood_Type?: string;
  Height?: number;
  Weight?: number;
  Emergency_Contact_Name?: string;
  Emergency_Contact_Phone?: string;
  Insurance_Provider?: string;
  Insurance_Policy_Number?: string;
  Created_at?: Date;
  Updated_at?: Date;
}

export const patientApi = {
  getByUserId: async (userId: number): Promise<Patient> => {
    try {
      const response = await apiClient.get(`/patients/user/${userId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  update: async (patientId: number, patientData: Partial<Patient>): Promise<Patient> => {
    try {
      const response = await apiClient.patch(`/patients/${patientId}`, patientData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  create: async (patientData: Omit<Patient, 'Patient_id'>): Promise<Patient> => {
    try {
      const response = await apiClient.post('/patients', patientData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};