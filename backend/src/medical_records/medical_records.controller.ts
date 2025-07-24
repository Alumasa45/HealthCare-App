import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MedicalRecordsService } from './medical_records.service';
import { CreateMedicalRecordDto } from './dto/create-medical_record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical_record.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  @ApiOperation({ summary: 'Registration of medical records.'})
  create(@Body() createMedicalRecordDto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.create(createMedicalRecordDto);
  }

  @Get()
    @ApiOperation({ summary: 'Returns all medical records.'})
  findAll() {
    return this.medicalRecordsService.findAll();
  }

  @Get(':id')
    @ApiOperation({ summary: 'Returns one medical record by Id.'})
  findOne(@Param('id') id: string) {
    return this.medicalRecordsService.findOne(+id);
  }

  @Patch(':id')
    @ApiOperation({ summary: 'Updates medical records by Id.'})
  update(@Param('id') id: string, @Body() updateMedicalRecordDto: UpdateMedicalRecordDto) {
    return this.medicalRecordsService.update(+id, updateMedicalRecordDto);
  }

  @Delete(':id')
    @ApiOperation({ summary: 'Deletes medical records by Id.'})
  remove(@Param('id') id: string) {
    return this.medicalRecordsService.remove(+id);
  }
}
