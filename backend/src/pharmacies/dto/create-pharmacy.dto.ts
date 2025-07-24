import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString, matches, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePharmacyDto {
    // @ApiProperty({ description: 'Pharmacy unique identification number.'})
    // @IsNumber()
    // @IsNotEmpty()
    // Pharmacy_id: number;

    @ApiProperty({ description: 'User Id foreign key.'})
    @IsNumber()
    @IsNotEmpty()
    User_id: number;

    @ApiProperty({ description: 'Pharmacy name.'})
    @IsNotEmpty()
    @IsString()
    Pharmacy_Name: string;

    @ApiProperty({ description: 'License number for the pharmacy.'})
    @IsString()
    @IsNotEmpty()
    License_Number: string;

    @ApiProperty({ description: 'Pharmacist phone number.'})
    @IsNotEmpty()
    @IsString()
    Phone_Number: string;

    @ApiProperty({ description: 'Email registered under the pharmacy.'})
    @IsString()
    @IsNotEmpty()
    Email: string;

    @ApiProperty({ description: 'Operating hours for the clinic.'})
    @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    Opening_Time: string;

    @ApiProperty({ description: 'Operating hours for the clinic.'})
    @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    Closing_Time: string;

    @ApiProperty({ description: 'Whether the Pharmacy does deliveries.'})
    @IsBoolean()
    Delivery_Available: boolean;

    @ApiProperty({ description: 'Whether the pharmacy is verified to operate.'})
    @IsBoolean()
    Is_Verified: boolean;

    @ApiProperty({ description: 'Pharmacy Rating.'})
    @IsNumber()
    Rating: number;

    @ApiProperty({ description: 'Time the pharmacy was added to the system.'})
    Created_at: Date;

    @ApiProperty({ description: 'Time the pharmacy info was updated.'})
    Updated_at: Date;
}
