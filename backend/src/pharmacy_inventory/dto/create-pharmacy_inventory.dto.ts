import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePharmacyInventoryDto {
  @ApiProperty({ description: 'Pharmacy Id foreign key.' })
  @IsNotEmpty()
  @IsNumber()
  Pharmacy_id: number;

  @ApiProperty({ description: 'Medicine Id foreign key.' })
  @IsNumber()
  @IsNotEmpty()
  Medicine_id: number;

  @ApiProperty({ description: 'Batch number for the items.', required: false })
  @IsString()
  Batch_Number?: string;
  @ApiProperty({
    description: 'Expiry date for the medicines.',
    required: false,
  })
  @IsString()
  Expiry_Date?: string;

  @ApiProperty({ description: 'Total stock quantity.' })
  @IsNotEmpty()
  @IsNumber()
  Stock_Quantity: number;

  @ApiProperty({ description: 'Unit price for each items.' })
  @IsNotEmpty()
  @IsNumber()
  Unit_Price: number;

  @ApiProperty({ description: 'Wholesale price for items.' })
  @IsNotEmpty()
  @IsNumber()
  Wholesale_Price: number;

  @ApiProperty({ description: 'Supplier name.', required: false })
  @IsString()
  Supplier_Name?: string;
  
  @ApiProperty({ description: 'Date the items were last restocked.' })
  @IsNotEmpty()
  @IsString()
  Last_Restocked: string;

  @ApiProperty({
    description: 'Date the inventory was created.',
    required: false,
  })
  Created_at?: Date;

  @ApiProperty({
    description: 'Date the inventory was updated.',
    required: false,
  })
  Updated_at?: Date;
}
