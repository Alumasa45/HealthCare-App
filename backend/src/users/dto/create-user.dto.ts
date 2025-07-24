import { User_Type } from "../entities/user.entity";
import { Gender } from "../entities/user.entity";
import { Account_Status } from "../entities/user.entity";
import {IsNotEmpty, IsEmail, IsString } from 'class-validator'
import {ApiProperty} from '@nestjs/swagger'

export class CreateUserDto {
    // @ApiProperty({ description: 'Unique User Identification number.'})
    // @IsNotEmpty()
    // @IsNumber()
    // User_id: number;

    @ApiProperty({ description: 'Users email.'})
    @IsEmail()
    @IsNotEmpty()
    Email: string;

    @ApiProperty({ description: 'Users password.'})
    @IsNotEmpty()
    Password: string;

    @ApiProperty({ description: 'Users phone number.'})
    @IsNotEmpty()
    Phone_Number: string;

    @ApiProperty({ description: 'User type.'})
    User_Type: User_Type;

    @ApiProperty({ description: 'Users first name.'})
    @IsString()
    @IsNotEmpty()
    First_Name: string;

    @ApiProperty({ description: 'Users last name.'})
    @IsString()
    @IsNotEmpty()
    Last_Name: string;

    @ApiProperty({ description: 'Users date of Birth.'})
    @IsString()
    Date_of_Birth: String;

    @ApiProperty({ description: 'Users gender.'})
    Gender: Gender;

    // @ApiProperty({ description: 'Link to users profile.'})
    // @IsString()
    // Profile_image?: string;

    @ApiProperty({description: 'Describes account status, whether it is active or inactive.'})
    Account_Status: Account_Status;

    // @ApiProperty({ description: 'Date the user was created.'})
    // @IsDate()
    // Created_at?: Date;
}
