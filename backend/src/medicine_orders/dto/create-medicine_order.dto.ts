import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  Order_Status,
  Payment_Status,
} from '../entities/medicine_order.entity';
import { Type } from 'class-transformer';

export class MedicineOrderItemDto {
  @ApiProperty({ description: 'Medicine ID' })
  @IsNotEmpty()
  @IsNumber()
  Medicine_id: number;

  @ApiProperty({ description: 'Quantity ordered' })
  @IsNotEmpty()
  @IsNumber()
  Quantity: number;

  @ApiProperty({ description: 'Unit price of the medicine' })
  @IsNotEmpty()
  @IsNumber()
  Unit_Price: number;

  @ApiProperty({ description: 'Total price for this item' })
  @IsNotEmpty()
  @IsNumber()
  Total_Price: number;
}

export class CreateMedicineOrderDto {
  @ApiProperty({ description: 'Patient Id foreign key.' })
  @IsNotEmpty()
  @IsNumber()
  Patient_id: number;

  @ApiProperty({ description: 'Pharmacy Id foreign key.' })
  @IsNumber()
  @IsNotEmpty()
  Pharmacy_id: number;

  @ApiProperty({ description: 'Prescription Id foreign key.', required: false })
  @IsOptional()
  @IsNumber()
  Prescription_id?: number;

  @ApiProperty({ description: 'Total amount for the order.' })
  @IsNumber()
  @IsNotEmpty()
  Total_Amount: number;

  @ApiProperty({ description: 'Order status.', enum: Order_Status })
  @IsString()
  @IsNotEmpty()
  Order_Status: string;

  @ApiProperty({ description: 'Payment status.', enum: Payment_Status })
  @IsString()
  @IsNotEmpty()
  Payment_Status: string;

  @ApiProperty({ description: 'Payment method.', required: false })
  @IsOptional()
  @IsString()
  Payment_Method?: string;

  @ApiProperty({ description: 'Delivery address.' })
  @IsString()
  @IsNotEmpty()
  Delivery_Address: string;

  @ApiProperty({ description: 'Expected delivery date.', required: false })
  @IsOptional()
  Delivery_Date?: Date;

  @ApiProperty({
    description: 'Special notes or instructions.',
    required: false,
  })
  @IsOptional()
  @IsString()
  Notes?: string;

  @ApiProperty({ description: 'Order items', type: [MedicineOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicineOrderItemDto)
  orderItems: MedicineOrderItemDto[];
}
