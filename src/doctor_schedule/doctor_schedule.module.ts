import { Module } from '@nestjs/common';
import { DoctorScheduleService } from './doctor_schedule.service';
import { DoctorScheduleController } from './doctor_schedule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorSchedule } from './entities/doctor_schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DoctorSchedule]),
  ],
  controllers: [DoctorScheduleController],
  providers: [DoctorScheduleService],
})
export class DoctorScheduleModule {}
