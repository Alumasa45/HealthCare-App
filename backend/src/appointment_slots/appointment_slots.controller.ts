import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Returns all appointment slots or filtered by doctor and date.'})
  findAll(@Query('Doctor_id') Doctor_id?: string, @Query('date') date?: string) {
    if (Doctor_id && date) {
      console.log(`Backend: Finding slots for doctor ${Doctor_id} on date ${date}`);
      return this.appointmentSlotsService.findByDoctorAndDate(+Doctor_id, date);
    }
    return this.appointmentSlotsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Returns one appointment slot by Id.'})
  findOne(@Param('id') Slot_id: string) {
    return this.appointmentSlotsService.findOne(+Slot_id);
  }

  @Patch(':id')
  update(@Param('id') Slot_id: string, @Body() updateAppointmentSlotDto: UpdateAppointmentSlotDto) {
    return this.appointmentSlotsService.update(+Slot_id, updateAppointmentSlotDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletes appointment slots by Id.'})
  delete(@Param('id') Slot_id: string) {
    return this.appointmentSlotsService.delete(+Slot_id);
  }
}
