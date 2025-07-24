import { PartialType } from '@nestjs/mapped-types';
import { CreatePharmacyInventoryDto } from './create-pharmacy_inventory.dto';

export class UpdatePharmacyInventoryDto extends PartialType(CreatePharmacyInventoryDto) {}
