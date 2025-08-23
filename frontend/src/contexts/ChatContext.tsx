import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { getConversations, createConversation } from "../api/conversations";
import {
  getMessages,
  createMessage,
  markMessageAsRead,
  verifyMessageDependencies,
} from "../api/messages";
import type { CreateMessageDto } from "../api/interfaces/message";
import { createSender } from "../api/senders";
import { ConversationType } from "../api/interfaces/conversation";

interface Message {
  id: string;
  Sender_id: number;
  content: string;
  timestamp: Date;
  type: "text" | "image" | "file" | "system";
  status: "sending" | "sent" | "delivered" | "read" | "error";
  attachmentUrl?: string;
  attachmentName?: string;
}

interface User {
  id: string;
  name: string;
  role: "patient" | "doctor" | "pharmacist";
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

interface Chat {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  type: "direct" | "group";
  title?: string;
}

interface ChatContextType {
  chats: Chat[];
  messages: Message[];
  selectedChatId: string | null;
  loading: boolean;
  error: string | null;
  selectChat: (chatId: string) => void;
  sendMessage: (content: string, file?: File) => Promise<void>;
  createNewConversation: (User_id: number, title?: string) => Promise<string>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessageTime, setLastMessageTime] = useState<number>(0);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.User_id) return;

      setLoading(true);
      setError(null);

      try {
        const conversations = await getConversations(user.User_id);
        const transformedChats = await Promise.all(
          conversations.map(async (conv) => {
            try {
              const participantId = conv.sender?.toString() || "unknown";
              const mockParticipant = {
                id: participantId,
                name: conv.Title || `User ${participantId}`,
                role: "patient" as "patient" | "doctor" | "pharmacist",
                isOnline: Math.random() > 0.5,
              };

              let lastMessage: Message | undefined;
              let unreadCount = 0;

              try {
                const conversationMessages = await getMessages(
                  conv.Conversation_id
                );
                if (conversationMessages.length > 0) {
                  const lastMsg =
                    conversationMessages[conversationMessages.length - 1];
                  lastMessage = {
                    id: lastMsg.Message_id?.toString() || `msg-${Date.now()}`,
                    Sender_id: lastMsg.Sender_id || "",
                    content: lastMsg.Content || "",
                    timestamp: lastMsg.Created_at
                      ? new Date(lastMsg.Created_at)
                      : new Date(),
                    type: lastMsg.Attachment_Url ? "file" : "text",
                    status: lastMsg.Is_read ? "read" : "delivered",
                  } as Message;

                  unreadCount = conversationMessages.filter(
                    (msg) =>
                      !msg.Is_read &&
                      msg.Sender_id?.toString() !== user.User_id.toString()
                  ).length;
                }
              } catch (msgError) {
                console.error(
                  "Error fetching messages for conversation:",
                  msgError
                );
              }

              return {
                id: conv.Conversation_id.toString(),
                participants: [mockParticipant],
                type: conv.Type.toLowerCase() as "direct" | "group",
                unreadCount,
                title: conv.Title,
                lastMessage,
              } as Chat;
            } catch (convError) {
              console.error("Error processing conversation:", convError);
              return {
                id: conv.Conversation_id.toString(),
                participants: [
                  {
                    id: "unknown",
                    name: "Unknown User",
                    role: "patient" as const,
                    isOnline: false,
                  },
                ],
                type: "direct" as const,
                unreadCount: 0,
                title: conv.Title || "Chat",
              } as Chat;
            }
          })
        );

        setChats(transformedChats);
        if (transformedChats.length > 0 && !selectedChatId) {
          setSelectedChatId(transformedChats[0].id);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        setError("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]); //dependency - user.

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChatId) {
        setMessages([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log("🔄 Fetching messages for chat:", selectedChatId);
        const messagesData = await getMessages(parseInt(selectedChatId));
        console.log("📨 Fetched messages:", messagesData.length);

        if (messagesData && messagesData.length > 0) {
          const transformedMessages = messagesData.map(
            (msg) =>
              ({
                id: msg.Message_id?.toString() || `msg-${Date.now()}`,
                Sender_id: msg.Sender_id || "",
                content: msg.Content || "",
                timestamp: msg.Created_at
                  ? new Date(msg.Created_at)
                  : new Date(),
                type: msg.Attachment_Url ? "file" : "text",
                status: msg.Is_read ? "read" : "delivered",
                attachmentUrl: msg.Attachment_Url || undefined,
                attachmentName: msg.Attachment_Url
                  ? msg.Attachment_Url.split("/").pop()
                  : undefined,
              } as Message)
          );

          setMessages(transformedMessages);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        setError("Failed to load messages");
        setMessages([]); // make empty array instead of keeping old messages.
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChatId]);

  const selectChat = (chatId: string) => {
    console.log("🔄 Selecting chat:", chatId);
    console.log("🔄 Current selected chat:", selectedChatId);

    // Prevent selecting the same chat multiple times
    if (chatId === selectedChatId) {
      console.log("⚠️ Same chat already selected, skipping");
      return;
    }

    // Clear messages before switching to prevent showing old messages.
    setMessages([]);
    setError(null);
    setSelectedChatId(chatId);
  };

  const sendMessage = async (content: string, file?: File) => {
    if (!selectedChatId || !user?.User_id) {
      console.error("Cannot send message: missing selectedChatId or user", {
        selectedChatId,
        userId: user?.User_id,
      });
      return;
    }

    // Validate user object
    if (typeof user.User_id !== "number" || user.User_id <= 0) {
      console.error("Invalid user ID:", user.User_id);
      console.error("Full user object:", user);
      return;
    }

    // Additional check: ensure User_id is an integer
    if (!Number.isInteger(user.User_id)) {
      console.error("User ID is not an integer:", user.User_id);
      return;
    }

    // Validate input
    if (!content.trim() && !file) {
      console.error("Cannot send empty message without attachment");
      return;
    }

    // Validate conversation ID
    const conversationId = parseInt(selectedChatId);
    if (isNaN(conversationId) || conversationId <= 0) {
      console.error("Invalid conversation ID:", selectedChatId);
      return;
    }

    // Rate limiting: prevent sending messages too quickly (max 1 per second)
    const now = Date.now();
    if (now - lastMessageTime < 1000) {
      console.warn("Rate limit: Please wait before sending another message");
      return;
    }
    setLastMessageTime(now);

    const hasAttachment = !!file;

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      Sender_id: user.User_id,
      content,
      timestamp: new Date(),
      type: hasAttachment ? "file" : "text",
      status: "sending",
      attachmentName: file?.name,
      attachmentUrl: file ? URL.createObjectURL(file) : undefined,
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      // Debug the IDs we're about to use
      console.log("=== Message Creation Debug ===");
      console.log("Selected Chat ID (string):", selectedChatId);
      console.log("Parsed Conversation ID:", conversationId);
      console.log("User ID:", user.User_id);
      console.log("User object:", user);
      console.log("==============================");

      // Verify that the conversation and user exist before attempting to create message
      console.log("🔍 Verifying message dependencies...");
      const verification = await verifyMessageDependencies(
        conversationId,
        user.User_id
      );

      if (!verification.conversationExists || !verification.userExists) {
        console.error(
          "❌ Dependencies verification failed:",
          verification.errors
        );
        throw new Error(
          `Cannot send message: ${verification.errors.join(", ")}`
        );
      }

      console.log("✅ All dependencies verified successfully");

      // Create and validate message data
      const messageData: CreateMessageDto = {
        Conversation_id: conversationId,
        Sender_id: user.User_id,
        Content: content.trim(),
        Message_Type: ConversationType.direct,
      };

      // Add attachment if present
      if (hasAttachment && file) {
        // For now, we'll handle file upload as a simple attachment URL
        // In a real implementation, you'd upload the file first and get a URL
        const fakeAttachmentUrl = `uploads/${file.name}`;
        messageData.Attachment_Url = fakeAttachmentUrl;
      }

      // Final validation before sending
      if (!messageData.Content && !messageData.Attachment_Url) {
        throw new Error("Message must have either content or attachment");
      }

      console.log("Sending message with data:", {
        ...messageData,
        Content:
          messageData.Content.substring(0, 50) +
          (messageData.Content.length > 50 ? "..." : ""),
        userInfo: {
          userId: user.User_id,
          userType: typeof user.User_id,
        },
      });

      const response = await createMessage(messageData);
      console.log("Message sent successfully:", {
        messageId: response.Message_id,
        conversationId: response.Conversation_id,
      });

      const realMessage: Message = {
        id: response.Message_id?.toString() || `msg-${Date.now()}`,
        Sender_id:
          typeof response.Sender_id === "number"
            ? response.Sender_id
            : Number(response.Sender_id),
        content: response.Content || content,
        timestamp: response.Created_at
          ? new Date(response.Created_at)
          : new Date(),
        type: response.Attachment_Url ? "file" : "text",
        status: "delivered",
        attachmentUrl: response.Attachment_Url || undefined,
        attachmentName: response.Attachment_Url
          ? response.Attachment_Url.split("/").pop()
          : undefined,
      };

      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempMessage.id ? realMessage : msg))
      );

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === selectedChatId
            ? { ...chat, lastMessage: realMessage }
            : chat
        )
      );

      setTimeout(async () => {
        try {
          if (response.Message_id) {
            await markMessageAsRead(response.Message_id);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === realMessage.id ? { ...msg, status: "read" } : msg
              )
            );
          }
        } catch (error) {
          console.error("Error marking message as read:", error);
        }
      }, 2000);
    } catch (error: any) {
      console.error("Error sending message:", error);

      // Provide more detailed error information
      if (error.response) {
        console.error("Server responded with error:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });

        // Show user-friendly error message based on status code
        let errorMessage = "Failed to send message";
        switch (error.response.status) {
          case 400:
            errorMessage = "Invalid message data. Please check your input.";
            break;
          case 401:
            errorMessage =
              "You are not authorized to send messages. Please log in again.";
            break;
          case 403:
            errorMessage =
              "You don't have permission to send messages in this conversation.";
            break;
          case 404:
            errorMessage =
              "Conversation not found. Please refresh and try again.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = `Error: ${error.response.status} - ${error.response.statusText}`;
        }

        console.warn("User-friendly error message:", errorMessage);
      } else if (error.request) {
        console.error("Network error - no response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }

      // Update the temp message to show error state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id ? { ...msg, status: "error" } : msg
        )
      );
    }
  };

  const createNewConversation = async (
    User_id: number,
    title?: string
  ): Promise<string> => {
    if (!user?.User_id) throw new Error("User not authenticated");

    try {
      setLoading(true);

      const conversationData = {
        Title: title || `Chat with User ${User_id}`,
        Type: ConversationType.direct,
        Is_Active: true,
        Sender_id: user.User_id,
      };

      const newConversation = await createConversation(conversationData);

      await createSender({
        Conversation_id: newConversation.Conversation_id,
        User_Type: { User_Type: user?.User_Type || "Patient" },
        Joined_at: new Date(),
        Is_Active: true,
      });

      const newChat: Chat = {
        id: newConversation.Conversation_id.toString(),
        participants: [
          {
            id: User_id.toString(),
            name: `User ${User_id}`,
            role: "patient",
            isOnline: false,
          },
        ],
        unreadCount: 0,
        type: "direct",
        title: conversationData.Title,
      };

      setChats((prev) => [newChat, ...prev]);
      setSelectedChatId(newChat.id);

      return newChat.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw new Error("Failed to create conversation");
    } finally {
      setLoading(false);
    }
  };

  const value: ChatContextType = {
    chats,
    messages,
    selectedChatId,
    loading,
    error,
    selectChat,
    sendMessage,
    createNewConversation,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
