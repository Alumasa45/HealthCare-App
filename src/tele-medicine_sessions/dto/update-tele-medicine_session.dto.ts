import { PartialType } from '@nestjs/mapped-types';
import { CreateTeleMedicineSessionDto } from './create-tele-medicine_session.dto';

export class UpdateTeleMedicineSessionDto extends PartialType(CreateTeleMedicineSessionDto) {}
