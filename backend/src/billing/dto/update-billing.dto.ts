import { PartialType } from '@nestjs/mapped-types';
import { CreateBillingDto } from './create-billing.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../entities/billing.entity';

export class UpdateBillingDto extends PartialType(CreateBillingDto) {
  @ApiProperty({ description: 'Payment method.', required: false })
  @IsEnum(PaymentMethod)
  @IsOptional()
  Payment_Method?: PaymentMethod;

  @ApiProperty({ description: 'Payment date.', required: false })
  @IsOptional()
  Payment_Date?: Date;
}

export class PayBillDto {
  @ApiProperty({ description: 'Payment method.' })
  @IsEnum(PaymentMethod)
  Payment_Method: PaymentMethod;
}