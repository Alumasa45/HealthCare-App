import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Public()
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('/Coco')
  async askCoco(@Body() body: { message: string; role: 'doctor' | 'patient' | 'pharmacist' | 'admin' }) {
    try {
      const { message, role } = body;

      if (!message || !role) {
        return {
          success: false,
          error: 'Message and role are required',
          timestamp: new Date().toISOString(),
        };
      }

      const reply = await this.chatbotService.askCoco(message, role);
      return {
        success: true,
        assistant: 'Coco',
        data: { reply },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Chatbot controller error:', error);
      return {
        success: false,
        error: 'An error occurred while processing your request',
        details: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
  }
}