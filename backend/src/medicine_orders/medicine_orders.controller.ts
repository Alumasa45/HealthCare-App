import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MedicineOrdersService } from './medicine_orders.service';
import { CreateMedicineOrderDto } from './dto/create-medicine_order.dto';
import { UpdateMedicineOrderDto } from './dto/update-medicine_order.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('medicine-orders')
export class MedicineOrdersController {
  constructor(private readonly medicineOrdersService: MedicineOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Registers a new medicine order.' })
  create(@Body() createMedicineOrderDto: CreateMedicineOrderDto) {
    return this.medicineOrdersService.create(createMedicineOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Finds all medicine orders.' })
  findAll() {
    return this.medicineOrdersService.findAll();
  }

  @Get('pharmacy/:pharmacyId')
  @ApiOperation({ summary: 'Finds all orders for a specific pharmacy.' })
  findByPharmacy(@Param('pharmacyId') pharmacyId: string) {
    return this.medicineOrdersService.findByPharmacy(+pharmacyId);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Finds all orders for a specific patient.' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.medicineOrdersService.findByPatient(+patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Finds one medicine order by Id.' })
  findOne(@Param('id') id: string) {
    return this.medicineOrdersService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Updates medicine order by Id.' })
  update(
    @Param('id') id: string,
    @Body() updateMedicineOrderDto: UpdateMedicineOrderDto,
  ) {
    return this.medicineOrdersService.update(+id, updateMedicineOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletes medicine order by Id.' })
  remove(@Param('id') id: string) {
    return this.medicineOrdersService.remove(+id);
  }
}
