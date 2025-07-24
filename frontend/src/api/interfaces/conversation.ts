export enum ConversationType {
  direct = 'Direct',
  group = 'Group',
  consultation = 'Consultation'
}

export { ConversationType as ConvoType }

export interface Conversation {
  Conversation_id: number;
  Title?: string;
  Type: ConversationType;
  Is_Active: boolean;
  Created_at: Date;
  sender?: {
    Sender_id: number;
    // Add other sender properties as needed
  };
}

export interface CreateConversationDto {
  Title?: string;
  Type: ConversationType;
  Is_Active: boolean;
  Sender_id?: number;
}
