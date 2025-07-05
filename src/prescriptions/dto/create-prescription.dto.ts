import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Status } from "../entities/prescription.entity";

export class CreatePrescriptionDto {
    // @ApiProperty({ description: 'Unique identification for each prescription.'})
    //     @IsNotEmpty()
    //     @IsNumber()
    //     Prescription_id: number;
    
        @ApiProperty({ description: 'Patient Id foreign key.'})
        @IsNotEmpty()
        @IsNumber()
        Patient_id: number;
        
        @ApiProperty({ description: 'Doctor Id foreign key.'})
        @IsNotEmpty()
        @IsNumber()
        Doctor_id: number;
    
        @ApiProperty({ description: 'Appointment Id foreign key.'})
        @IsNotEmpty()
        @IsNumber()
        Appointment_id:number;
    
        @ApiProperty({ description: 'Prescription number.'})
        @IsString()
        @IsNotEmpty()
        Prescription_Number: string;
    
        @ApiProperty({ description: 'Date os issuing.'})
        @IsNotEmpty()
        Issue_Date: Date;
    
        @ApiProperty({ description: 'Validity period.'})
        @IsNotEmpty()
        Validity_Period: Date;
    
        @ApiProperty({ description: 'Total amount for the items.'})
        @IsNumber()
        Total_Amount: number;
    
        @ApiProperty({ description: 'Status of the prescription.'})
        Status: Status;
    
        @ApiProperty({ description: 'Notes by the doctor.'})
        @IsString()
        Notes: string;
    
        @ApiProperty({ description: 'Date the prescription record was created.'})
        Created_at: Date;
    
        @ApiProperty({ description: 'Date the prescription record was updated.'})
        Updated_at: Date;
}
