import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { User_Type } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'User registration.' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login.' })
  async login(@Body() body: { Email: string; Password: string }) {
    return this.usersService.login(body.Email, body.Password);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all users.' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('public')
  @ApiOperation({
    summary: 'Get all users for public use (without sensitive data).',
  })
  findAllPublic() {
    return this.usersService.findAllPublic();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one user by Id.' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by Id.' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by Id.' })
  delete(@Param('id') id: string) {
    return this.usersService.delete(+id);
  }

  @Post('refresh')
  async refresh(@Body() body: { userId: number; hashedRefreshToken: string }) {
    return this.usersService.refreshTokens(
      body.userId,
      body.hashedRefreshToken,
    );
  }

  @Post('logout/:id')
  async logout(@Param('id') id: string) {
    return this.usersService.logout(Number(id));
  }
}
