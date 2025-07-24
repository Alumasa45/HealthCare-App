import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class DoctorLoginDto {
  @ApiProperty({ 
    description: 'Doctor license number', 
    example: 'DOC123456' 
  })
  @IsString()
  @IsNotEmpty()
  License_number: string;
}