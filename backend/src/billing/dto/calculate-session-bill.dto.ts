import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SessionOrderItem {
  @ApiProperty({ description: 'Medicine order ID' })
  @IsNumber()
  Order_id: number;

  @ApiProperty({ description: 'Total amount for this order' })
  @IsNumber()
  Total_Amount: number;
}

export class CalculateSessionBillDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsNumber()
  Patient_id: number;

  @ApiProperty({ description: 'Appointment ID (optional)', required: false })
  @IsOptional()
  @IsNumber()
  Appointment_id?: number;

  @ApiProperty({ description: 'Consultation fee (if any)', required: false })
  @IsOptional()
  @IsNumber()
  Consultation_Fee?: number;

  @ApiProperty({
    description: 'Array of medicine orders in session',
    type: [SessionOrderItem],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SessionOrderItem)
  Medicine_Orders?: SessionOrderItem[];

  @ApiProperty({
    description: 'Array of prescription IDs (if any)',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  Prescription_ids?: number[];

  @ApiProperty({ description: 'Additional fees description', required: false })
  @IsOptional()
  Additional_Description?: string;
}
