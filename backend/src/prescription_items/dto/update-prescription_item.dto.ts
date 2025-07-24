import { PartialType } from '@nestjs/mapped-types';
import { CreatePrescriptionItemDto } from './create-prescription_item.dto';

export class UpdatePrescriptionItemDto extends PartialType(CreatePrescriptionItemDto) {}
