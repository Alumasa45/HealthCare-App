import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ description: 'User ID to send notification to' })
  @IsNotEmpty()
  @IsNumber()
  User_id: number;

  @ApiProperty({
    description: 'Type of notification',
    enum: ['prescription', 'appointment', 'billing', 'general'],
  })
  @IsNotEmpty()
  @IsEnum(['prescription', 'appointment', 'billing', 'general'])
  Type: 'prescription' | 'appointment' | 'billing' | 'general';

  @ApiProperty({ description: 'Notification title' })
  @IsNotEmpty()
  @IsString()
  Title: string;

  @ApiProperty({ description: 'Notification message' })
  @IsNotEmpty()
  @IsString()
  Message: string;

  @ApiProperty({ description: 'Related entity ID (optional)', required: false })
  @IsOptional()
  @IsNumber()
  Related_id?: number;

  @ApiProperty({
    description: 'Notification status',
    enum: ['unread', 'read'],
    default: 'unread',
  })
  @IsOptional()
  @IsEnum(['unread', 'read'])
  Status?: 'unread' | 'read' = 'unread';
}
