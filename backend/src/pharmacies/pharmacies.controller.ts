import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { PharmaciesService } from './pharmacies.service';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginPharmacyDto } from './dto/pharmacy-login.dto';

@Controller('pharmacies')
export class PharmaciesController {
  constructor(private readonly pharmaciesService: PharmaciesService) {}

  @Post()
  @ApiOperation({ summary: 'Registers a new pharmacy.'})
  create(@Body() createPharmacyDto: CreatePharmacyDto) {
    return this.pharmaciesService.create(createPharmacyDto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiResponse({ status: 200, description: 'Login Successful!'})
  @ApiResponse({ status: 401, description: 'Unauthorized'})
  @ApiOperation({ summary: 'Pharmacist login.'})
  async doctorLogin(@Body() pharmacyLoginDto: LoginPharmacyDto) {
      return this.pharmaciesService.pharmacistLogin(pharmacyLoginDto.License_Number);
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
