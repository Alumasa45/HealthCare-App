import { IsNotEmpty, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateTeleMedicineSessionDto {
    @ApiProperty({ description: 'Unique session identifier number.'})
    @IsNotEmpty()
    @IsNumber()
    Session_id: number;
    
    @ApiProperty({ description: 'Appointment Id foreign key'})
    @IsNotEmpty()
    @IsNumber()
    Appointment_id: number;
    
    @ApiProperty({ description: 'Patient Id foreign key'})
    @IsNotEmpty()
    @IsNumber()
    Patient_id: number;
    
    @ApiProperty({ description: 'Doctor Id foreign key'})
    @IsNotEmpty()
    @IsNumber()
    Doctor_id: number;
}
