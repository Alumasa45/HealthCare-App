import { IsBoolean, IsDate, IsNotEmpty, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateAppointmentSlotDto {
    // @ApiProperty({ description: 'Unique identification for the slot.'})
    //     @IsNotEmpty()
    //     @IsNumber()
    //     Slot_id: number;
    
        @ApiProperty({ description: 'Appointment Id foreign key.'})
        @IsNotEmpty()
        @IsNumber()
        Appointment_id: number;
    
        @ApiProperty({ description: 'Doctor Id foreign key.'})
        @IsNotEmpty()
        @IsNumber()
        Doctor_id: number;
    
        @ApiProperty({ description: 'Date with open slot.'})
        @IsNotEmpty()
        Slot_Date: Date;
    
        @ApiProperty({ description: 'Time with open slot.'})
        @IsNotEmpty()
        Slot_Time: Date;
    
        @ApiProperty({ description: 'Appointment availability.'})
        @IsBoolean()
        Is_Available: boolean;
    
        @ApiProperty({ description: 'Shows if appointment is blocked.'})
        @IsBoolean()
        Is_Blocked: boolean;
    
        @ApiProperty({ description: 'Time appointment was created.'})
        Created_at: Date;
        
        @ApiProperty({ description: 'Time appointment was created.'})
        Updated_at: Date;
}
