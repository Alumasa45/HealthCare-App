import { PartialType } from '@nestjs/mapped-types';
import { CreateDoctorScheduleDto } from './create-doctor_schedule.dto';

export class UpdateDoctorScheduleDto extends PartialType(CreateDoctorScheduleDto) {}
