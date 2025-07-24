import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messagesRepository.create(createMessageDto);
    return await this.messagesRepository.save(message);
  }

  async findAll(): Promise<Message[]> {
    return await this.messagesRepository.find({
      relations: ['sender', 'conversation'],
    });
  }

  async findByConversation(conversationId: number): Promise<Message[]> {
    return await this.messagesRepository.find({
      where: { Conversation_id: conversationId },
      relations: ['sender', 'conversation'],
      order: { Created_at: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Message> {
    const message = await this.messagesRepository.findOne({
      where: { Message_id: id },
      relations: ['sender', 'conversation'],
    });
    
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    
    return message;
  }

  async update(id: number, updateMessageDto: UpdateMessageDto): Promise<Message> {
    const message = await this.findOne(id);
    
    Object.assign(message, updateMessageDto);
    
    return await this.messagesRepository.save(message);
  }

  async markAsRead(id: number): Promise<Message> {
    const message = await this.findOne(id);
    
    message.Is_read = true;
    
    return await this.messagesRepository.save(message);
  }

  async remove(id: number): Promise<void> {
    const message = await this.findOne(id);
    await this.messagesRepository.remove(message);
  }
}