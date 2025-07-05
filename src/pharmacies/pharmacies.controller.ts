import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PharmaciesService } from './pharmacies.service';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('pharmacies')
export class PharmaciesController {
  constructor(private readonly pharmaciesService: PharmaciesService) {}

  @Post()
  @ApiOperation({ summary: 'Registers a new pharmacy.'})
  create(@Body() createPharmacyDto: CreatePharmacyDto) {
    return this.pharmaciesService.create(createPharmacyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Returns all pharmacies registered.'})
  findAll() {
    return this.pharmaciesService.findAll();
  }

  @Get(':id')
   @ApiOperation({ summary: 'Returns one pharmacy registered by Id.'})
  findOne(@Param('id') id: string) {
    return this.pharmaciesService.findOne(+id);
  }

  @Patch(':id')
   @ApiOperation({ summary: 'Updates pharmacy information by Id.'})
  update(@Param('id') id: string, @Body() updatePharmacyDto: UpdatePharmacyDto) {
    return this.pharmaciesService.update(+id, updatePharmacyDto);
  }

  @Delete(':id')
   @ApiOperation({ summary: 'Removes pharmacy registered by Id.'})
  delete(@Param('id') id: string) {
    return this.pharmaciesService.delete(+id);
  }
}
