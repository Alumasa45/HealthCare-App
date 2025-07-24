import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { Conversation } from './entities/conversation.entity';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) {}

  create(createConversationDto: CreateConversationDto) {
    const conversation = this.conversationRepository.create(createConversationDto);
    return this.conversationRepository.save(conversation);
  }

  findAll() {
    return this.conversationRepository.find({ relations: ['sender'] });
  }

  findByUserId(userId: number) {
    return this.conversationRepository.find({
      where: { sender: { Sender_id: userId } },
      relations: ['sender'],
    });
  }

  findOne(id: number) {
    return this.conversationRepository.findOne({
      where: { Conversation_id: id },
      relations: ['sender'],
    });
  }

  async update(id: number, updateConversationDto: UpdateConversationDto) {
    await this.conversationRepository.update(id, updateConversationDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const conversation = await this.findOne(id);
    await this.conversationRepository.delete(id);
    return conversation;
  }
}
