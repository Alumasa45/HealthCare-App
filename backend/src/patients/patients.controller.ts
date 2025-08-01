import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientProfileService } from './patient-profile.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('patients')
export class PatientsController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly patientProfileService: PatientProfileService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Register patients.' })
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Gets all patients.' })
  findAll() {
    return this.patientsService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Gets patient by User Id.' })
  findByUserId(@Param('userId') userId: string) {
    return this.patientsService.findByUserId(+userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Gets patient by Id.' })
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Updates Patient info by Id.' })
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientsService.update(+id, updatePatientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletes Patient by Id.' })
  delete(@Param('id') id: string) {
    return this.patientsService.delete(+id);
  }

  @Post('ensure-profiles')
  @ApiOperation({
    summary: 'Create missing patient profiles for all Patient-type users.',
  })
  async ensureMissingPatientProfiles() {
    return this.patientProfileService.createMissingPatientProfiles();
  }

  @Post('ensure-profile/:userId')
  @ApiOperation({
    summary: 'Ensure patient profile exists for a specific user.',
  })
  async ensurePatientProfile(@Param('userId') userId: string) {
    const result =
      await this.patientProfileService.ensurePatientProfile(+userId);
    return result || { message: 'Patient profile could not be created' };
  }

  @Post('validate-appointment/:userId')
  @ApiOperation({
    summary: 'Validate if user is ready for appointment booking.',
  })
  async validatePatientForAppointment(@Param('userId') userId: string) {
    return this.patientProfileService.validatePatientForAppointment(+userId);
  }
}
