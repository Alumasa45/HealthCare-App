import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePrescriptionItemDto {
        @ApiProperty({ description: 'Prescription Id foreign key.'})
        @IsNumber()
        @IsNotEmpty()
        Prescription_id: number; 
    
        @ApiProperty({ description: 'Medicine Id foreign key.'})
        @IsNumber()
        @IsNotEmpty()
        Medicine_id: number; 
    
        @ApiProperty({ description: 'Quantity prescribed.'})
        @IsNotEmpty()
        @IsNumber()
        Quantity_Prescribed: number; 
    
        @ApiProperty({ description: 'Dosage instructions.'})
        @IsString()
        Dosage_Instructions: string; 
    
        @ApiProperty({ description: 'Frequency of dosage.'})
        @IsString()
        Frequency: string; 
    
        @ApiProperty({ description: 'Duration which the pills should be taken.'})
        @IsString()
        Duration: string; 
    
        @ApiProperty({ description: 'Quantity given.'})
        @IsNumber()
        Quantity_Dispensed: number; 
    
        @ApiProperty({ description: 'Unit price for each of the prescribed medicine.'})
        @IsNumber()
        Unit_Price: number; 
    
        @ApiProperty({ description: 'Total price for the prescribed items.'})
        @IsNumber()
        Total_Price: number; 
    
        @ApiProperty({ description: 'Whether substitution for the prescribed medicine id allowed.'})
        @IsBoolean()
        Substitution_Allowed: boolean; 
    
        @ApiProperty({ description: 'Day the prescribed item was added to the system.'})
        @IsOptional()
        Created_at: Date; 

        @ApiProperty({ description: 'Day the prescribed item was updated.'})
        @IsOptional()
        Updated_at: Date; 

}
