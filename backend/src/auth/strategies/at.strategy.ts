import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { User_Type } from "src/users/entities/user.entity";

export type JWTPayload = {
    sub: number;
    Email: string;
    User_Type: User_Type;
};

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt-at') {
    constructor(private readonly configServices: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configServices.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET')
        });
    }

    validate(payload: JWTPayload) {
        return payload;
    }
}
