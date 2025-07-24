import { ApiProperty } from "@nestjs/swagger";
import { Blood_Group } from "../entities/patient.entity";
import { IsNotEmpty, IsNumber, IsString, IsDate } from "class-validator";


export class CreatePatientDto {    
        @ApiProperty({ description: 'User id foreign key.'})
        @IsNotEmpty()
        @IsNumber()
        User_id: number;
    
        @ApiProperty({ description: 'Emergency contact name.'})
        @IsString()
        @IsNotEmpty()
        Emergency_Contact_Name: string;
    
        @ApiProperty({ description: 'Emergency contact phone number.'})
        @IsNotEmpty()
        @IsString()
        Emergency_Contact_Phone: string;
    
        @ApiProperty({ description: 'Emergency contact relationship.'})
        @IsNotEmpty()
        @IsString()
        Emergency_Contact_Relationship: string;
    
        @ApiProperty({ description: 'Patient blood group.'})
        @IsNotEmpty()
        Blood_Group: Blood_Group;
        
        @ApiProperty({ description: 'Patient height.'})
        @IsNotEmpty()
        @IsNumber()
        Height: number;
    
        @ApiProperty({ description: 'Patient weight.'})
        @IsNotEmpty()
        @IsNumber()
        Weight: number;
    
        @ApiProperty({ description: 'Patient allergies.'})
        @IsString()
        Allergies: string;
    
        @ApiProperty({ description: 'Patient chronic conditions.'})
        @IsString()
        Chronic_Conditions: string;
    
        @ApiProperty({ description: 'Patient Insurance provider.'})
        @IsString()
        Insurance_Provider: string;
    
        @ApiProperty({ description: 'Patient Insurance policy number.'})
        @IsString()
        Insurance_Policy_Number: string;
    
        @ApiProperty({ description: 'Time patient was added.'})
        Created_at: Date;
    
        @ApiProperty({ description: 'Time patient details were updated.'})
        Updated_at: Date;
}
