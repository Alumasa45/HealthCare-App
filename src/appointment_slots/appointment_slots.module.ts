import { Module } from '@nestjs/common';
import { AppointmentSlotsService } from './appointment_slots.service';
import { AppointmentSlotsController } from './appointment_slots.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentSlot } from './entities/appointment_slot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppointmentSlot])
  ],
  controllers: [AppointmentSlotsController],
  providers: [AppointmentSlotsService],
})
export class AppointmentSlotsModule {}
