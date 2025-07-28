import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { PaymentService, PaystackVerificationResponse } from './payment.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

interface InitializePaymentDto {
  email: string;
  amount: number;
  reference?: string;
  callback_url?: string;
  metadata?: any;
}

interface InitializeBillPaymentDto {
  patientEmail: string;
  callbackUrl?: string;
}

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initialize')
  @ApiOperation({ summary: 'Initialize a payment with Paystack' })
  @ApiResponse({ status: 200, description: 'Payment initialized successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async initialize(@Body() body: InitializePaymentDto) {
    return this.paymentService.initializePayment(body);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify a payment with Paystack' })
  @ApiResponse({ status: 200, description: 'Payment verified successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async verify(@Query('reference') reference: string) {
    if (!reference) {
      throw new BadRequestException('Payment reference is required');
    }
    return this.paymentService.verifyPayment(reference);
  }

  @Post('bill/:billId/initialize')
  @ApiOperation({ summary: 'Initialize payment for a specific bill' })
  @ApiParam({ name: 'billId', description: 'Bill ID to pay' })
  @ApiResponse({
    status: 200,
    description: 'Bill payment initialized successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  async initializeBillPayment(
    @Param('billId') billId: string,
    @Body() body: InitializeBillPaymentDto,
  ) {
    const billIdNum = parseInt(billId);
    if (isNaN(billIdNum)) {
      throw new BadRequestException('Invalid bill ID');
    }
    return this.paymentService.initializeBillPayment(
      billIdNum,
      body.patientEmail,
      body.callbackUrl,
    );
  }

  @Get('verify/:reference')
  @ApiOperation({ summary: 'Verify payment by reference (GET method)' })
  @ApiParam({ name: 'reference', description: 'Payment reference to verify' })
  @ApiResponse({ status: 200, description: 'Payment verified successfully' })
  async verifyByReference(@Param('reference') reference: string): Promise<PaystackVerificationResponse> {
    return this.paymentService.verifyPayment(reference);
  }
}
