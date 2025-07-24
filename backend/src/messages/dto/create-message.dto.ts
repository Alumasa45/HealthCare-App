import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ConvoType } from 'src/conversations/entities/conversation.entity';

export class CreateMessageDto {
  @ApiProperty({ description: 'Conversation ID' })
  @IsInt()
  @IsNotEmpty()
  Conversation_id: number;

  @ApiProperty({ description: 'Sender ID' })
  @IsInt()
  @IsNotEmpty()
  Sender_id: number;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  @IsOptional()
  Content?: string;

  @ApiProperty({ description: 'Message type', enum: ConvoType })
  @IsEnum(ConvoType)
  @IsNotEmpty()
  Message_Type: ConvoType;

  @ApiProperty({ description: 'Attachment URL', required: false })
  @IsString()
  @IsOptional()
  Attachment_Url?: string;
}