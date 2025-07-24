import { apiClient } from './apiClient';
import type { Conversation, CreateConversationDto } from './interfaces/conversation';

export const getConversations = async (userId: number): Promise<Conversation[]> => {
  const response = await apiClient.get(`/conversations/user/${userId}`);
  return response.data;
};

export const getConversation = async (conversationId: number): Promise<Conversation> => {
  const response = await apiClient.get(`/conversations/${conversationId}`);
  return response.data;
};

export const createConversation = async (conversationData: CreateConversationDto): Promise<Conversation> => {
  const response = await apiClient.post('/conversations', conversationData);
  return response.data;
};