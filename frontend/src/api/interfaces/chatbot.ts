import apiClient from "../apiClient";

export type UserRole = "doctor" | "patient" | "pharmacist" | "admin";

export interface AskCocoRequest {
  message: string;
  role: UserRole;
}

export interface AskCocoResponse {
  success: boolean;
  assistant: string;
  data: {
    reply: string;
  };
  timestamp: string;
}

export const chatbotApi = {
  askCoco: async (
    message: string,
    role: UserRole
  ): Promise<AskCocoResponse> => {
    try {
      const response = await apiClient.post<AskCocoResponse>("/chatbot/Coco", {
        message,
        role,
      });
      return response.data;
    } catch (error) {
      console.error("Error asking Coco:", error);
      throw new Error("Failed to get response from Coco");
    }
  },
};
