import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateMedicalRecordDto {
        @ApiProperty({ description: 'Patient Id foreign key.'})
        @IsNotEmpty()
        @IsNumber()
        Patient_id: number;
    
        @ApiProperty({ description: 'Doctor Id foreign key.'})
        @IsNotEmpty()
        @IsNumber()
        Doctor_id: number;
        
        @ApiProperty({ description: 'The date the patient visited.'})
        @IsNotEmpty()
        Visit_Date: Date;
    
        @ApiProperty({ description: 'Patient diagnosis.'})
        @IsNotEmpty()
        @IsString()
        Diagnosis: string;
    
        @ApiProperty({ description: 'Patient symptoms.'})
        @IsNotEmpty()
        @IsString()
        Symptoms: string;
    
        @ApiProperty({ description: 'Treatment plan followed.'})
        @IsNotEmpty()
        @IsString()
        Treatment_Plan: string;
    
        @ApiProperty({ description: 'Notes given by the attending doctor.'})
        @IsString()
        Notes: string;
    
        @ApiProperty({ description: 'Describes whether follow up is required.'})
        @IsBoolean()
        @IsNotEmpty()
        Follow_Up_Required: boolean;
    
        @ApiProperty({ description: 'Follow up date.'})
        Follow_Up_Date: Date;
    
        @ApiProperty({description: 'Date the medical record was created.'})
        Created_at: Date;
    
        @ApiProperty({description: 'Date the medical record was updated.'})
        Updated_at: Date;
}
