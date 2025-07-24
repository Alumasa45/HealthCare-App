import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Registers a new appointment.' })
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Returns all appointments or filtered by doctor/patient ID.',
  })
  findAll(@Query('Doctor_id') Doctor_id?: string) {
    if (Doctor_id) {
      return this.appointmentsService.findByDoctorId(+Doctor_id);
    }
    return this.appointmentsService.findAll();
  }

  @Get('doctor/:doctorId')
  @ApiOperation({ summary: 'Returns appointments for a specific doctor.' })
  findByDoctorId(@Param('doctorId') doctorId: string) {
    return this.appointmentsService.findByDoctorId(+doctorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Returns one appointment by Id.' })
  findOne(@Param('id') Slot_id: string) {
    return this.appointmentsService.findOne(+Slot_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Updates appointment information by Id.' })
  update(
    @Param('id') Slot_id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(+Slot_id, updateAppointmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletes appointment information by Id.' })
  delete(@Param('id') Slot_id: string) {
    return this.appointmentsService.delete(+Slot_id);
  }
}
