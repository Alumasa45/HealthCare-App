import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TeleMedicineSessionsService } from './tele-medicine_sessions.service';
import { CreateTeleMedicineSessionDto } from './dto/create-tele-medicine_session.dto';
import { UpdateTeleMedicineSessionDto } from './dto/update-tele-medicine_session.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('tele-medicine-sessions')
export class TeleMedicineSessionsController {
  constructor(private readonly teleMedicineSessionsService: TeleMedicineSessionsService) {}

  @Post()
  @ApiOperation({ summary: 'Registers new tele-medicine session.'})
  create(@Body() createTeleMedicineSessionDto: CreateTeleMedicineSessionDto) {
    return this.teleMedicineSessionsService.create(createTeleMedicineSessionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Finds all tele-medicine sessions.'})
  findAll() {
    return this.teleMedicineSessionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Finds one tele-medicine session by Id.'})
  findOne(@Param('id') id: string) {
    return this.teleMedicineSessionsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Updates a tele-medicine session by Id.'})
  update(@Param('id') id: string, @Body() updateTeleMedicineSessionDto: UpdateTeleMedicineSessionDto) {
    return this.teleMedicineSessionsService.update(+id, updateTeleMedicineSessionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletes a tele-medicine session by Id.'})
  delete(@Param('id') id: string) {
    return this.teleMedicineSessionsService.delete(+id);
  }
}
