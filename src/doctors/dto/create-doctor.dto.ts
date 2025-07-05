import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsString, IsDate } from "class-validator";

export class CreateDoctorDto {
        @ApiProperty({ description: 'User Id foreign Key.'})
        @IsNotEmpty()
        @IsNumber()
        User_id: number;
    
        @ApiProperty({ description: 'Doctor license number.'})
        @IsString()
        @IsNotEmpty()
        License_number: string;
        
        @ApiProperty({ description: 'Doctor Specialization.'})
        @IsNotEmpty()
        @IsString()
        Specialization: string;
    
        @ApiProperty({ description: 'Doctor qualification.'})
        @IsNotEmpty()
        @IsString()
        Qualification: string;
    
        @ApiProperty({ description: 'Doctor experience years.'})
        @IsNotEmpty()
        @IsNumber()
        Experience_Years: number;
    
        @ApiProperty({ description: 'Doctor department.'})
        @IsString()
        @IsNotEmpty()
        Department: string;
    
        @ApiProperty({ description: 'Doctors about.'})
        @IsString()
        @IsNotEmpty()
        Bio: string;
    
        @ApiProperty({ description: 'Languages spoken by the doctor.'})
        @IsNotEmpty()
        @IsString()
        Languages_Spoken: string;
    
        @ApiProperty({ description: 'Doctor availability online.'})
        @IsNotEmpty()
        @IsBoolean()
        Is_Available_Online: boolean;
    
        @ApiProperty({ description: 'Doctor rating.'})
        @IsNumber()
        Rating: number;
    
        @ApiProperty({ description: 'Doctor total reviews.'})
        @IsNotEmpty()
        Reviews: string;
    
        @ApiProperty({description: 'Date the doctor account was created.'})
        Created_at: Date;
    
        @ApiProperty({description: 'Date the doctor account was created.'})
        Updated_at: Date;
}
