import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicalRecordDto } from './create-medical_record.dto';

export class UpdateMedicalRecordDto extends PartialType(CreateMedicalRecordDto) {}
