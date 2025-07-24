import { apiClient } from './apiClient';
import type{ CreateMessageDto, Message } from './interfaces/message';

export const getMessages = async (conversationId: number): Promise<Message[]> => {
  const response = await apiClient.get(`/messages/conversation/${conversationId}`);
  return response.data;
};

export const createMessage = async (messageData: CreateMessageDto): Promise<Message> => {
  const response = await apiClient.post('/messages', messageData);
  return response.data;
};

export const markMessageAsRead = async (messageId: number): Promise<Message> => {
  const response = await apiClient.patch(`/messages/${messageId}/read`, {});
  return response.data;
};