import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Account_Status, User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class UsersService {
  constructor( 
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    try {
      console.log("first",createUserDto)
      const existingUser = await this.userRepository.findOne({
        where: { Email: createUserDto.Email }
      });
      
      if (existingUser) {
        return { error: "User already exists." };
      }
      
      const { Password, ...userdata } = createUserDto;
      const hashedPassword = await bcrypt.hash(Password, 10);
      const user = this.userRepository.create({
        ...userdata,
        Password: hashedPassword
      });
      
      // Save the user.
      const savedUser = await this.userRepository.save(user);
      const { Password: _, ...userResponse } = savedUser;
      return userResponse;
      
    } catch (error) {
      console.error('Error creating user:', error);
      return { error: "Failed to create user", details: error.message };
    }
  }

  async login(Email: string, Password: string): Promise<any> {
    try {
      const user = await this.findByEmail(Email);
      if (!user) {
        throw new Error('User not found, please register first.');
      }
      
      const isPasswordValid = await bcrypt.compare(Password, user.Password);
      if (!isPasswordValid) {
        throw new Error('Invalid Password!');
      }
      
      const { Password: _, ...userResponse } = user;
      return userResponse;
      
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async findByEmail(Email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { Email } });
  }

  async findAll(): Promise<User[] | string> {
    try {
      return await this.userRepository.find();
    } catch (error) {
      return "No user found.";
    }
  }

  async findOne(User_id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { User_id: User_id } });
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