import { Module } from '@nestjs/common';
import { TeleMedicineSessionsService } from './tele-medicine_sessions.service';
import { TeleMedicineSessionsController } from './tele-medicine_sessions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeleMedicineSession } from './entities/tele-medicine_session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TeleMedicineSession])
  ],
  controllers: [TeleMedicineSessionsController],
  providers: [TeleMedicineSessionsService],
})
export class TeleMedicineSessionsModule {}
