import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { User } from 'src/users/entities/user.entity';
import { DoctorsService } from 'src/doctors/doctors.service';
import { DoctorsModule } from 'src/doctors/doctors.module';
import { Doctor } from 'src/doctors/entities/doctor.entity';

@Module({
  imports: [UsersModule, DoctorsModule,
    TypeOrmModule.forFeature([Auth, User, Doctor]),
  JwtModule.register({
    global: true,
    secret: jwtConstants.secret,
    signOptions: { expiresIn: '100s'},
  })
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
