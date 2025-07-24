import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Account_Status, User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  private async generateAccessToken(user: User): Promise<string> {
    return this.jwtService.signAsync({
      sub: user.User_id,
      Email: user.Email,
      User_Type: user.User_Type,
    });
  }

  private async generateRefreshToken(user: User): Promise<string> {
    return this.jwtService.signAsync(
      { sub: user.User_id, Email: user.Email },
      {
        expiresIn: '7d',
        secret:
          process.env.JWT_REFRESH_TOKEN_SECRET || 'your-refresh-secret-key',
      },
    );
  }

  async create(createUserDto: CreateUserDto): Promise<any> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { Email: createUserDto.Email },
      });
      if (existingUser) {
        throw new ConflictException({ error: 'User already exists.' });
      }
      const { Password, ...userdata } = createUserDto;
      const hashedPassword = await bcrypt.hash(Password, 10);
      const user = this.userRepository.create({
        ...userdata,
        Password: hashedPassword,
      });
      const savedUser = await this.userRepository.save(user);
      const { Password: _, ...userResponse } = savedUser;
      const accessToken = await this.generateAccessToken(savedUser);
      const hashedRefreshToken = await this.generateRefreshToken(savedUser);
      await this.userRepository.update(savedUser.User_id, {
        hashedRefreshToken,
      });
      return { user: userResponse, accessToken, hashedRefreshToken };
    } catch (error) {
      throw error;
    }
  }

  async login(Email: string, Password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { Email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
    const { Password: _, ...userResponse } = user;
    const accessToken = await this.generateAccessToken(user);
    const hashedRefreshToken = await this.generateRefreshToken(user);
    await this.userRepository.update(user.User_id, { hashedRefreshToken });
    return { user: userResponse, accessToken, hashedRefreshToken };
  }

  async refreshTokens(
    userId: number,
    hashedRefreshToken: string,
  ): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { User_id: userId },
    });
    if (!user || user.hashedRefreshToken !== hashedRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const accessToken = await this.generateAccessToken(user);
    const newRefreshToken = await this.generateRefreshToken(user);
    await this.userRepository.update(user.User_id, {
      hashedRefreshToken: newRefreshToken,
    });
    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: number): Promise<{ message: string }> {
    await this.userRepository.update(userId, { hashedRefreshToken: undefined });
    return { message: 'Logged out successfully' };
  }

  async findByEmail(Email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { Email } });
  }

  async findAll(): Promise<User[] | string> {
    try {
      return await this.userRepository.find();
    } catch (error) {
      return 'No user found.';
    }
  }

  async findAllPublic(): Promise<Partial<User>[]> {
    try {
      const users = await this.userRepository.find({
        select: ['User_id', 'First_Name', 'Last_Name', 'Email', 'User_Type'],
      });
      return users;
    } catch (error) {
      return [];
    }
  }

  async findOne(User_id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { User_id: User_id },
    });
    if (!user) {
      throw new NotFoundException(`User with Id ${User_id} not found!`);
    }
    return user;
  }

  async update(User_id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(User_id);
    if (!user) {
      throw new NotFoundException(`User with ID ${User_id} not found!`);
    }

    const updateInfo: any = { ...updateUserDto };

    if (updateInfo.Account_Status === 'Active') {
      updateInfo.Account_Status = Account_Status.Active;
    } else if (updateInfo.Account_Status === 'InActive') {
      updateInfo.Account_Status = Account_Status.InActive;
    }

    await this.userRepository.update({ User_id: User_id }, updateInfo);
    return this.findOne(User_id);
  }

  async delete(User_id: number): Promise<any> {
    try {
      const user = await this.findOne(User_id);
      if (!user) {
        throw new Error('⚠User Not Found!');
      }

      await this.userRepository.delete({ User_id: User_id });
      return { message: 'User deleted successfully😌' };
    } catch (error) {
      throw new Error(`Delete failed!: ${error.message}`);
    }
  }
}
