import { apiClient } from "./apiClient";
import type { CreateMessageDto, Message } from "./interfaces/message";
import { handleApiError } from "./errorUtils";

// Helper function to verify that required entities exist
export const verifyMessageDependencies = async (
  conversationId: number,
  senderId: number
) => {
  const results = {
    conversationExists: false,
    userExists: false,
    errors: [] as string[],
  };

  try {
    await apiClient.get(`/conversations/${conversationId}`);
    results.conversationExists = true;
    console.log(`✅ Conversation ${conversationId} exists`);
  } catch (error: any) {
    results.errors.push(`Conversation ${conversationId} not found`);
    console.error(
      `❌ Conversation ${conversationId} not found:`,
      error.response?.status
    );
  }

  try {
    await apiClient.get(`/users/${senderId}`);
    results.userExists = true;
    console.log(`✅ User ${senderId} exists`);
  } catch (error: any) {
    results.errors.push(`User ${senderId} not found`);
    console.error(`❌ User ${senderId} not found:`, error.response?.status);
  }

  return results;
};

export const getMessages = async (
  conversationId: number
): Promise<Message[]> => {
  try {
    if (!conversationId || conversationId <= 0) {
      throw new Error("Invalid conversation ID provided");
    }

    const response = await apiClient.get(
      `/messages/conversation/${conversationId}`
    );

    // Ensure response data is an array
    if (!Array.isArray(response.data)) {
      console.warn("Expected messages array, got:", response.data);
      return [];
    }

    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createMessage = async (
  messageData: CreateMessageDto
): Promise<Message> => {
  try {
    // Validate required fields
    if (!messageData.Conversation_id || messageData.Conversation_id <= 0) {
      throw new Error("Invalid conversation ID");
    }

    if (!messageData.Sender_id || messageData.Sender_id <= 0) {
      throw new Error("Invalid sender ID");
    }

    if (!messageData.Content || !messageData.Content.trim()) {
      throw new Error("Message content cannot be empty");
    }

    if (!messageData.Message_Type) {
      throw new Error("Message type is required");
    }

    // Check if conversation exists before creating message
    try {
      console.log(
        `Validating conversation ${messageData.Conversation_id} exists...`
      );
      await apiClient.get(`/conversations/${messageData.Conversation_id}`);
    } catch (convError: any) {
      console.error("Conversation validation failed:", convError);
      if (convError.response?.status === 404) {
        throw new Error(
          `Conversation ${messageData.Conversation_id} not found. Please refresh and try again.`
        );
      }
      // If it's another error, continue anyway - might be a permissions issue
      console.warn(
        "Conversation validation failed with non-404 error, continuing..."
      );
    }

    // Check if user/sender exists
    try {
      console.log(`Validating user ${messageData.Sender_id} exists...`);
      await apiClient.get(`/users/${messageData.Sender_id}`);
    } catch (userError: any) {
      console.error("User validation failed:", userError);
      if (userError.response?.status === 404) {
        throw new Error(
          `User ${messageData.Sender_id} not found. Please log in again.`
        );
      }
      // If it's another error, continue anyway
      console.warn("User validation failed with non-404 error, continuing...");
    }

    console.log("Creating message with validated data:", {
      ...messageData,
      Content:
        messageData.Content.length > 100
          ? messageData.Content.substring(0, 100) + "..."
          : messageData.Content,
    });

    // Log the exact data types to help debug foreign key issues
    console.log("Data types:", {
      Conversation_id: typeof messageData.Conversation_id,
      Sender_id: typeof messageData.Sender_id,
      Message_Type: typeof messageData.Message_Type,
      Conversation_id_value: messageData.Conversation_id,
      Sender_id_value: messageData.Sender_id,
    });

    const response = await apiClient.post("/messages", messageData);
    return response.data;
  } catch (error) {
    console.error("Error in createMessage:", error);
    throw handleApiError(error);
  }
};

export const markMessageAsRead = async (
  messageId: number
): Promise<Message> => {
  try {
    if (!messageId || messageId <= 0) {
      throw new Error("Invalid message ID provided");
    }

    const response = await apiClient.patch(`/messages/${messageId}/read`, {});
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
