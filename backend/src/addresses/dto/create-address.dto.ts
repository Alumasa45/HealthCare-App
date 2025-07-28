import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Address_Type } from "../entities/address.entity";
import { ApiProperty } from "@nestjs/swagger";


export class CreateAddressDto {

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ description: 'User Id foreign key.'})
    User_id: number;

    @IsNotEmpty()
    @ApiProperty({ description: 'Address type.'})
    Address_Type: Address_Type;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Country where the address is based.'})
    Country: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'City where the address is based.'})
    City: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'Postal code of the address.'})
    Postal_Code: string;

    @ApiProperty({ 
    description: 'Time the address was added. Optional - will be set automatically if not provided.',
    required: false
  })
  Created_at?: Date;
}
