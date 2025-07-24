import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PrescriptionItemsService } from './prescription_items.service';
import { CreatePrescriptionItemDto } from './dto/create-prescription_item.dto';
import { UpdatePrescriptionItemDto } from './dto/update-prescription_item.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('prescription-items')
export class PrescriptionItemsController {
  constructor(private readonly prescriptionItemsService: PrescriptionItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Registers new prescription item.'})
  create(@Body() createPrescriptionItemDto: CreatePrescriptionItemDto) {
    return this.prescriptionItemsService.create(createPrescriptionItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Finds all prescription items.'})
  findAll() {
    return this.prescriptionItemsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Finds one prescription item by Id.'})
  findOne(@Param('id') id: string) {
    return this.prescriptionItemsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Updates prescription items by Id.'})
  update(@Param('id') id: string, @Body() updatePrescriptionItemDto: UpdatePrescriptionItemDto) {
    return this.prescriptionItemsService.update(+id, updatePrescriptionItemDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletes prescription items by Id.'})
  delete(@Param('id') id: string) {
    return this.prescriptionItemsService.delete(+id);
  }
}
