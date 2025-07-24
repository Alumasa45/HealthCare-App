import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEmail,
} from 'class-validator';
import { Gender } from 'src/users/entities/user.entity';

export class CreateDoctorDto {
  @ApiProperty({ description: 'Doctor email address.' })
  @IsEmail()
  @IsNotEmpty()
  Email: string;

  @ApiProperty({ description: 'Doctor password.' })
  @IsNotEmpty()
  @IsString()
  Password: string;

  @ApiProperty({ description: 'Doctor phone number.' })
  @IsNotEmpty()
  @IsString()
  Phone_Number: string;

  @ApiProperty({ description: 'Doctor first name.' })
  @IsString()
  @IsNotEmpty()
  First_Name: string;

  @ApiProperty({ description: 'Doctor last name.' })
  @IsString()
  @IsNotEmpty()
  Last_Name: string;

  @ApiProperty({ description: 'Doctor date of birth.' })
  @IsString()
  Date_of_Birth: string;

  @ApiProperty({ description: 'Doctor gender.' })
  Gender: Gender;

  // Doctor-specific fields
  @ApiProperty({ description: 'Doctor license number.' })
  @IsString()
  @IsNotEmpty()
  License_number: string;

  @ApiProperty({ description: 'Doctor Specialization.' })
  @IsNotEmpty()
  @IsString()
  Specialization: string;

  @ApiProperty({ description: 'Doctor qualification.' })
  @IsNotEmpty()
  @IsString()
  Qualification: string;

  @ApiProperty({ description: 'Doctor experience years.' })
  @IsNotEmpty()
  @IsNumber()
  Experience_Years: number;

  @ApiProperty({ description: 'Doctor department.' })
  @IsString()
  @IsNotEmpty()
  Department: string;

  @ApiProperty({ description: 'Doctors about.' })
  @IsString()
  @IsNotEmpty()
  Bio: string;

  @ApiProperty({ description: 'Languages spoken by the doctor.' })
  @IsNotEmpty()
  @IsString()
  Languages_Spoken: string;

  @ApiProperty({ description: 'Doctor availability online.' })
  @IsNotEmpty()
  @IsBoolean()
  Is_Available_Online: boolean;

  @ApiProperty({ description: 'Doctor rating.' })
  @IsNumber()
  Rating: number;

  @ApiProperty({ description: 'Doctor total reviews.' })
  @IsNotEmpty()
  Reviews: string;

  @ApiProperty({ description: 'Date the doctor account was created.' })
  Created_at?: Date;

  @ApiProperty({ description: 'Date the doctor account was last updated.' })
  Updated_at?: Date;
}
