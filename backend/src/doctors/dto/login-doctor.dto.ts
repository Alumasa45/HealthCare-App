import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDoctorDto {
  @IsString()
  @IsNotEmpty()
  License_number: string;
}

export class LoginResponseDto {
  success?: boolean;
  accessToken: string;
  refreshToken: string;
  doctor?: {
    License_number: string;
  };
}