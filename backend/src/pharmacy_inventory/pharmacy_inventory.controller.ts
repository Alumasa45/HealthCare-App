import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PharmacyInventoryService } from './pharmacy_inventory.service';
import { CreatePharmacyInventoryDto } from './dto/create-pharmacy_inventory.dto';
import { UpdatePharmacyInventoryDto } from './dto/update-pharmacy_inventory.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('pharmacy-inventory')
export class PharmacyInventoryController {
  constructor(private readonly pharmacyInventoryService: PharmacyInventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Registers a new inventory.'})
  create(@Body() createPharmacyInventoryDto: CreatePharmacyInventoryDto) {
    return this.pharmacyInventoryService.create(createPharmacyInventoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Finds all inventories.'})
  findAll() {
    return this.pharmacyInventoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Finds one inventory bi Id.'})
  findOne(@Param('id') id: string) {
    return this.pharmacyInventoryService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Updates inventory by Id.'})
  update(@Param('id') id: string, @Body() updatePharmacyInventoryDto: UpdatePharmacyInventoryDto) {
    return this.pharmacyInventoryService.update(+id, updatePharmacyInventoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletes inventory by Id.'})
  delete(@Param('id') id: string) {
    return this.pharmacyInventoryService.delete(+id);
  }
}
