import apiClient from "./apiClient";
import type { AskCocoResponse } from "./interfaces/chatbot";

export enum UserType {
  DOCTOR = "Doctor",
  PHARMACY = "Pharmacist",
  ADMIN = "Admin",
  PATIENT = "Patient",
}

export const askCoco = async (
  message: string,
  role: UserType,
  User_id: number
): Promise<AskCocoResponse> => {
  try {
    const response = await apiClient.post<AskCocoResponse>("/chatbot/Coco", {
      message,
      role,
      User_id,
    });
    return response.data;
  } catch (error) {
    console.error("Error asking Coco:", error);
    throw new Error("Failed to get response from Coco");
  }
};
