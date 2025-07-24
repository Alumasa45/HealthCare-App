import { Module } from '@nestjs/common';
import { AppointmentSlotsService } from './appointment_slots.service';
import { AppointmentSlotsController } from './appointment_slots.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentSlot } from './entities/appointment_slot.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppointmentSlot, Doctor])
  ],
  controllers: [AppointmentSlotsController],
  providers: [AppointmentSlotsService],
  exports: [AppointmentSlotsService],
})
export class AppointmentSlotsModule {}
