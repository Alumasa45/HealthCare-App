import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Public()
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('/Coco')
  async askCoco(@Body() body: { message: string; role: 'doctor' | 'patient' | 'pharmacist' | 'admin' }) {
    const { message, role } = body;

    const reply = await this.chatbotService.askCoco(message, role);
    return {
      success: true,
      assistant: 'Coco',
      data: { reply },
      timestamp: new Date().toISOString(),
    };
  }
}