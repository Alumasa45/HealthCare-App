import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Day_Of_The_Week } from "../entities/doctor_schedule.entity";

export class CreateDoctorScheduleDto {
    // @ApiProperty({ description: 'Unique identifier for the schedule.'})
    //     @IsNotEmpty()
    //     @IsNumber()
    //     Schedule_id: number;
    
        @ApiProperty({ description: 'Doctor Id foreign key.'})
        @IsNotEmpty()
        @IsNumber()
        Doctor_id: number;
    
        @ApiProperty({ description: 'Day of the week.'})
        @IsNotEmpty()
        Day_Of_The_Week: Day_Of_The_Week;
    
        @ApiProperty({ description: 'Time when the doctors shift starts'})
        @IsNotEmpty()
        Start_Time: Date;
    
        @ApiProperty({ description: 'Time when the doctors shift ends'})
        @IsNotEmpty()
        End_Time: Date;
    
        @ApiProperty({ description: 'Time the slot takes.'})
        @IsNotEmpty()
        @IsNumber()
        Slot_Duration: number;
    
        @ApiProperty({ description: 'Activity status.'})
        @IsBoolean()
        Is_Active: Boolean;
    
        @ApiProperty({ description: 'Time the schedule was created.'})
        Created_at: Date;
        
        @ApiProperty({ description: 'Time the schedule was updated.'})
        Updated_at: Date;
}
