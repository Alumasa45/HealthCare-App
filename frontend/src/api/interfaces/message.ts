import { ConversationType } from './conversation';

export interface Message {
  Message_id: number;
  Conversation_id: number;
  Sender_id: number;
  Content: string;
  Message_Type: ConversationType;
  Attachment_Url?: string;
  Is_read: boolean;
  Created_at: Date;
  Updated_at?: Date;
}

export interface CreateMessageDto {
  Conversation_id: number;
  Sender_id: number;
  Content: string;
  Message_Type: ConversationType;
  Attachment_Url?: string;
}