import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Address registration.'})
  create(@Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.create(createAddressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Gets all addresses.'})
  findAll() {
    return this.addressesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Gets one address by Id'})
  findOne(@Param('id') Address_id: string) {
    return this.addressesService.findOne(+Address_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Updates addresses by Id.'})
  update(@Param('id') Address_id: string, @Body() updateAddressDto: UpdateAddressDto) {
    return this.addressesService.update(+Address_id, updateAddressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletes addresse by Id.'})
  remove(@Param('id') Address_id: string) {
    return this.addressesService.remove(+Address_id);
  }
}
