import { Module } from '@nestjs/common';
import { SendersService } from './senders.service';
import { SendersController } from './senders.controller';

@Module({
  controllers: [SendersController],
  providers: [SendersService],
})
export class SendersModule {}
