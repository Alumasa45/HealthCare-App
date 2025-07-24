import { apiClient } from './apiClient';
import type{ CreateSenderDto, Sender } from './interfaces/sender';

export const getSenders = async (conversationId: number): Promise<Sender[]> => {
  const response = await apiClient.get(`/senders/conversation/${conversationId}`);
  return response.data;
};

export const createSender = async (senderData: CreateSenderDto): Promise<Sender> => {
  const response = await apiClient.post('/senders', senderData);
  return response.data;
};