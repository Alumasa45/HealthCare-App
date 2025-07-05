import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";


export class CreateAuthDto {
    @ApiProperty({ 
    description: 'The email of the user', 
    example: 'example@gmail.com', 
    required: true 
  })
  @IsNotEmpty()
  @IsEmail()
  Email: string;

  @ApiProperty({ 
    description: 'The password of the user', 
    example: 'strongpassword123', 
    required: true 
  })
  @IsNotEmpty()
  @IsString()
  Password: string;
}
