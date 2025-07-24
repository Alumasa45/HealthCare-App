import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { PaymentMethod, PaymentStatus } from "../entities/billing.entity";

export class CreateBillingDto {
  @ApiProperty({ description: 'Patient ID foreign key.' })
  @IsNotEmpty()
  @IsNumber()
  Patient_id: number;

  @ApiProperty({ description: 'Appointment ID foreign key.', required: false })
  @IsOptional()
  @IsNumber()
  Appointment_id?: number;

  @ApiProperty({ description: 'Prescription ID foreign key.', required: false })
  @IsOptional()
  @IsNumber()
  Prescription_id?: number;

  @ApiProperty({ description: 'Order ID foreign key.', required: false })
  @IsOptional()
  @IsNumber()
  Order_id?: number;

  @ApiProperty({ description: 'Date the bill was issued.' })
  @IsNotEmpty()
  Bill_Date: Date;

  @ApiProperty({ description: 'Due date for payment.' })
  @IsNotEmpty()
  Due_Date: Date;

  @ApiProperty({ description: 'Base amount before tax and discounts.' })
  @IsNotEmpty()
  @IsNumber()
  Amount: number;

  @ApiProperty({ description: 'Tax amount.' })
  @IsNotEmpty()
  @IsNumber()
  Tax_Amount: number;

  @ApiProperty({ description: 'Discount amount.' })
  @IsNumber()
  @IsOptional()
  Discount_Amount?: number;

  @ApiProperty({ description: 'Total amount after tax and discounts.' })
  @IsNotEmpty()
  @IsNumber()
  Total_Amount: number;

  @ApiProperty({ description: 'Payment status.' })
  @IsEnum(PaymentStatus)
  @IsOptional()
  Payment_Status?: PaymentStatus;

  @ApiProperty({ description: 'Description of the bill.' })
  @IsString()
  @IsNotEmpty()
  Description: string;
}