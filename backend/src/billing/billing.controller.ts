import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { PayBillDto, UpdateBillingDto } from './dto/update-billing.dto';
import { CalculateSessionBillDto } from './dto/calculate-session-bill.dto';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bill' })
  @ApiResponse({ status: 201, description: 'Bill created successfully' })
  create(@Body() createBillingDto: CreateBillingDto) {
    return this.billingService.create(createBillingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bills or filter by patient ID' })
  @ApiQuery({ name: 'patientId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Bills retrieved successfully' })
  findAll(@Query('patientId') patientId?: string) {
    return this.billingService.findAll(patientId ? +patientId : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a bill by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Bill retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  findOne(@Param('id') id: string) {
    return this.billingService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a bill' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Bill updated successfully' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  update(@Param('id') id: string, @Body() updateBillingDto: UpdateBillingDto) {
    return this.billingService.update(+id, updateBillingDto);
  }

  @Patch(':id/pay')
  @ApiOperation({ summary: 'Pay a bill' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
  @ApiResponse({ status: 400, description: 'Payment failed' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  payBill(@Param('id') id: string, @Body() payBillDto: PayBillDto) {
    return this.billingService.payBill(+id, payBillDto);
  }

  @Post('calculate-session-bill')
  @ApiOperation({
    summary:
      'Calculate total bill for user session (consultation + medicines + prescriptions)',
  })
  @ApiResponse({
    status: 200,
    description: 'Session bill calculated successfully',
  })
  calculateSessionBill(
    @Body() calculateSessionBillDto: CalculateSessionBillDto,
  ) {
    return this.billingService.calculateSessionBill(calculateSessionBillDto);
  }

  @Post('create-session-bill')
  @ApiOperation({ summary: 'Create consolidated bill for user session' })
  @ApiResponse({
    status: 201,
    description: 'Session bill created successfully',
  })
  createSessionBill(@Body() calculateSessionBillDto: CalculateSessionBillDto) {
    return this.billingService.createSessionBill(calculateSessionBillDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bill' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Bill deleted successfully' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  remove(@Param('id') id: string) {
    return this.billingService.remove(+id);
  }
}
