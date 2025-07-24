import { Module } from '@nestjs/common';
import { DoctorScheduleService } from './doctor_schedule.service';
import { DoctorScheduleController } from './doctor_schedule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorSchedule } from './entities/doctor_schedule.entity';
import { AppointmentSlot } from '../appointment_slots/entities/appointment_slot.entity';
import { Doctor } from '../doctors/entities/doctor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DoctorSchedule, AppointmentSlot, Doctor]),
  ],
  controllers: [DoctorScheduleController],
  providers: [DoctorScheduleService],
  exports: [DoctorScheduleService],
})
export class DoctorScheduleModule {}
