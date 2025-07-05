import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DoctorScheduleService } from './doctor_schedule.service';
import { CreateDoctorScheduleDto } from './dto/create-doctor_schedule.dto';
import { UpdateDoctorScheduleDto } from './dto/update-doctor_schedule.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('doctor-schedule')
export class DoctorScheduleController {
  constructor(private readonly doctorScheduleService: DoctorScheduleService) {}

  @Post()
  @ApiOperation({ summary: 'Registers the doctors schedule.'})
  create(@Body() createDoctorScheduleDto: CreateDoctorScheduleDto) {
    return this.doctorScheduleService.create(createDoctorScheduleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Returns all the schedule info.'})
  findAll() {
    return this.doctorScheduleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Returns schedule information by Id.'})
  findOne(@Param('id') id: string) {
    return this.doctorScheduleService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Updates doctor schedule info by Id.'})
  update(@Param('id') id: string, @Body() updateDoctorScheduleDto: UpdateDoctorScheduleDto) {
    return this.doctorScheduleService.update(+id, updateDoctorScheduleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletes doctor schedule by Id.'})
  delete(@Param('id') id: string) {
    return this.doctorScheduleService.delete(+id);
  }
}
