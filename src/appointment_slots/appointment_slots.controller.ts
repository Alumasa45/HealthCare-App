import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AppointmentSlotsService } from './appointment_slots.service';
import { CreateAppointmentSlotDto } from './dto/create-appointment_slot.dto';
import { UpdateAppointmentSlotDto } from './dto/update-appointment_slot.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('appointment-slots')
export class AppointmentSlotsController {
  constructor(private readonly appointmentSlotsService: AppointmentSlotsService) {}

  @Post()
  @ApiOperation({ summary: 'Registers new appointment slots.'})
  create(@Body() createAppointmentSlotDto: CreateAppointmentSlotDto) {
    return this.appointmentSlotsService.create(createAppointmentSlotDto);
  }

  @Get()
  @ApiOperation({ summary: 'Returns all appointment slots.'})
  findAll() {
    return this.appointmentSlotsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Returns one appointment slot by Id.'})
  findOne(@Param('id') id: string) {
    return this.appointmentSlotsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAppointmentSlotDto: UpdateAppointmentSlotDto) {
    return this.appointmentSlotsService.update(+id, updateAppointmentSlotDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletes appointment slots by Id.'})
  delete(@Param('id') id: string) {
    return this.appointmentSlotsService.delete(+id);
  }
}
