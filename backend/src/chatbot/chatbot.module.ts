import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { AppointmentsModule } from 'src/appointments/appointments.module';

@Module({
  imports: [
    AppointmentsModule, 
  ],
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule {}
