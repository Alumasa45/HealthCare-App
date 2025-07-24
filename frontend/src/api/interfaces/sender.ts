import type{ Userr_Type } from './user';

export interface Sender {
  Sender_id: number;
  Conversation_id?: number;
  User_id?: number;
  User_Type: Userr_Type;
  Joined_at: Date;
  Left_at?: Date;
  Is_Active: boolean;
  Created_at: Date;
}

export interface CreateSenderDto {
  Conversation_id?: number;
  User_id?: number;
  User_Type: Userr_Type;
  Joined_at: Date;
  Is_Active: boolean;
}
