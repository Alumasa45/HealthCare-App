import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as Bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
  @InjectRepository(User) private userRepository: Repository<User>,
  private jwtService: JwtService,
    private configService: ConfigService,
 ) {}

  private async getTokens(User_id: number, Email: string, User_Type: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: User_id,
          Email: Email,
          User_Type: User_Type,
        },
        {
          secret: this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_SECRET',
          ),
          expiresIn: this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
          ), 
        },
      ),
      this.jwtService.signAsync(
        {
          sub: User_id,
          Email: Email,
          User_Type: User_Type,
        },
        {
          secret: this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_SECRET',
          ),
          expiresIn: this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
          ),
        },
      ),
    ]);
    return { accessToken: at, refreshToken: rt };
  }

 private async hashData(data: string): Promise<string> {
    const salt = await Bcrypt.genSalt(10);
    return await Bcrypt.hash(data, salt);
  }

 private async saveRefreshToken(User_id: number, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.userRepository.update(User_id, {
      hashedRefreshToken: hashedRefreshToken,
    });
  }

  async signIn(createAuthDto: CreateAuthDto) { 
    const foundUser = await this.userRepository.findOne({
      where: { Email: createAuthDto.Email },
      select: ['User_id', 'Email', 'Password', 'User_Type'], 
    });
    if (!foundUser) {
      throw new NotFoundException(
        `User with Email ${createAuthDto.Email} not found`,
      );
    }
   
    const foundPassword = await Bcrypt.compare(
      createAuthDto.Password,
      foundUser.Password,
    );
    console.log(foundUser);
    if (!foundPassword) {
      throw new NotFoundException('Invalid credentials');
    }
    
    const { accessToken, refreshToken } = await this.getTokens(
      Number(foundUser.User_id), 
      foundUser.Email,
      foundUser.User_Type,
    );

    await this.saveRefreshToken(Number(foundUser.User_id), refreshToken);
    return { accessToken, refreshToken };
  }

  async signOut(User_id:number) {
     const res = await this.userRepository.update(User_id, {
      hashedRefreshToken: String,
    });

    if (res.affected === 0) {
      throw new NotFoundException(`User with ID ${User_id} not found`);
    }
    return { message: `User with id : ${User_id} signed out successfully.` };
  }

   async refreshTokens(User_id: number, refreshToken: string) { 
     const foundUser = await this.userRepository.findOne({
      where: { User_id: User_id },
      select: ['User_id', 'Email', 'User_Type',]
    });

    if (!foundUser) {
      throw new NotFoundException(`User with ID ${User_id} not found`);
    }

    if (!foundUser.hashedRefreshToken) {
      throw new NotFoundException('No refresh token found');
    }

    const refreshTokenMatches = await Bcrypt.compare(
      refreshToken,
      foundUser.hashedRefreshToken,
    );

    if (!refreshTokenMatches) {
      throw new NotFoundException('Invalid refresh token');
    }

    const { accessToken, refreshToken: newRefreshToken } = await this.getTokens(
      Number(foundUser.User_id),
      foundUser.Email,
      foundUser.User_Type,
    );

    await this.saveRefreshToken(Number(foundUser.User_id), newRefreshToken);
    return { accessToken, refreshToken: newRefreshToken };
  }
}
