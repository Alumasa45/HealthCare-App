import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { DoctorLoginDto } from './dto/doctor-login.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  @ApiOperation({ summary: 'Doctor registration.'})
  async create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorsService.create(createDoctorDto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiResponse({ status: 200, description: 'Login Successful!'})
  @ApiResponse({ status: 401, description: 'Unauthorized'})
  @ApiOperation({ summary: 'Doctor login.'})
  async doctorLogin(@Body() doctorLoginDto: DoctorLoginDto) {
    return this.doctorsService.doctorLogin(doctorLoginDto.License_number);
  }

  @Get()
  @ApiOperation({ summary: 'Returns all doctors.'})
  async findAll() {
    return this.doctorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Returns one doctor by Id.'})
  async findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Updates doctor information by Id.'})
  async update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    return this.doctorsService.update(+id, updateDoctorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletes doctor information by Id.'})
  async delete(@Param('id') id: string) {
    return this.doctorsService.delete(+id);
  }
}
