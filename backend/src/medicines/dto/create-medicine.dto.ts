import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Strength } from "../entities/medicine.entity";

export class CreateMedicineDto {
    // @ApiProperty({ description: 'Unique identifier for the medicine.'})
    // @IsNotEmpty()
    // @IsNumber()
    // Medicine_id: number;
    
    @ApiProperty({ description: 'Name of the medicine.'})
    @IsNotEmpty()
    @IsString()
    Medicine_Name: string;
    
    @ApiProperty({ description: 'Name of medicine brand.'})
    @IsNotEmpty()
    @IsString()
    Brand_Name: string;
    
    @ApiProperty({ description: 'Manufacturer of medicine brand.'})
    @IsNotEmpty()
    @IsString()
    Manufacturer: string;
    
    @ApiProperty({ description: 'Category of medicine brand.'})
    @IsNotEmpty()
    @IsString()
    Category: string;
    
    @ApiProperty({ description: 'Dosage of medicine.'})
    @IsNotEmpty()
    @IsString()
    Dosage: string;
    
    @ApiProperty({ description: 'Strength of medicine.'})
    @IsNotEmpty()
    Strength: Strength;
    
    @ApiProperty({ description: 'Description of medicine.'})
    @IsNotEmpty()
    @IsString()
    Description: string;
    
    @ApiProperty({ description: 'Side effects of the medicine.'})
    @IsString()
    @IsNotEmpty()
    Side_Effects: string;
    
    @ApiProperty({ description: 'Storage instructions for the medicine.'})
    @IsNotEmpty()
    @IsString()
    Storage_Instructions: string;
    
    @ApiProperty({ description: 'Time the medicine was added.'})
    Created_at: Date;
    
    @ApiProperty({ description: 'Time the medicine was updated.'})
    Updated_at: Date;
}
