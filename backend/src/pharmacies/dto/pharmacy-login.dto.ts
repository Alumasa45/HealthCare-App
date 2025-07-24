import { IsNotEmpty, IsString } from "class-validator";


export class LoginPharmacyDto {
    @IsString()
    @IsNotEmpty()
      License_Number: string;
}

export class LoginPharmResponseDto {
    success?: boolean;
    accessToken: string;
    refreshToken: string;
    pharmacist?: {
        License_Number: string;
    };
}