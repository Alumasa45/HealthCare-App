import { useMutation } from "@tanstack/react-query";
import { chatbotApi } from "@/api/interfaces/chatbot";

export type UserRole = "doctor" | "patient" | "pharmacist" | "admin";

export interface UseAskNuruParams {
  message: string;
  role: UserRole;
  userId: string;
}

export interface UseAskNuruResponse {
  reply: string;
  timestamp: string;
  assistant: string;
  message: string;
  role: UserRole;
  userId: string;
}

export const useAskNuru = () => {
  return useMutation<UseAskNuruResponse, Error, UseAskNuruParams>({
    mutationFn: async (data: UseAskNuruParams) => {
      if (!data.message || !data.role || !data.userId) {
        throw new Error("Both message, role and userId are required");
      }

      const response = await chatbotApi.askCoco(data.message, data.role);

      return {
        message: data.message,
        role: data.role,
        userId: data.userId,
        reply: response.data.reply,
        timestamp: response.timestamp,
        assistant: response.assistant,
      };
    },
    onError: (error) => {
      console.error("Failed to get response from Nuru/Coco:", error);
    },
    onSuccess: (data) => {
      console.log("Successfully got response from Nuru/Coco:", data);
    },
  });
};
