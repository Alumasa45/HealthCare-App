import { useMutation } from "@tanstack/react-query";
import { chatbotApi } from "@/api/interfaces/chatbot";

export type UserRole = "Doctor" | "Patient" | "Pharmacist" | "Admin";

export interface UseAskCocoParams {
  message: string;
  role: UserRole;
  User_id?: number; // Optional since backend doesn't require it
}

export interface UseAskCocoResponse {
  reply: string;
  timestamp: string;
  assistant: string;
  message: string;
  role: UserRole;
  User_id?: number; // Optional since backend doesn't provide it
}

export const useAskCoco = () => {
  return useMutation<UseAskCocoResponse, Error, UseAskCocoParams>({
    mutationFn: async (data: UseAskCocoParams) => {
      if (!data.message || !data.role) {
        throw new Error("Both message and role are required");
      }

      const apiRole = data.role.toLowerCase() as Parameters<
        typeof chatbotApi.askCoco
      >[1];
      const response = await chatbotApi.askCoco(data.message, apiRole);

      return {
        message: data.message,
        role: data.role,
        User_id: data.User_id,
        reply: response.data.reply,
        timestamp: response.timestamp,
        assistant: response.assistant,
      };
    },
    onError: (error) => {
      console.error("Failed to get response from Coco:", error);
    },
    onSuccess: (data) => {
      console.log("Successfully got response from Coco:", data);
    },
  });
};
