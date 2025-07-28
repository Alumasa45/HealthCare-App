import { Injectable, HttpException, Logger } from '@nestjs/common';
import axios from 'axios';
import { BillingService } from '../billing/billing.service';
import { PaymentMethod } from 'src/billing/entities/billing.entity';

export interface PaystackInitializeData {
  email: string;
  amount: number; // in kobo (multiply KES by 100)
  reference?: string;
  callback_url?: string;
  metadata?: {
    bill_id: number;
    patient_id: number;
    custom_fields?: any[];
  };
}

export interface PaystackVerificationResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
    amount: number;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    metadata: any;
  };
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private secretKey = process.env.PAYSTACK_SECRET_KEY;

  constructor(private readonly billingService: BillingService) {}

  async initializePayment(data: PaystackInitializeData) {
    try {
      this.logger.log(`Initializing payment for amount: ${data.amount} kobo`);

      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          ...data,
          reference:
            data.reference ||
            `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(
        `Payment initialization successful: ${response.data.data.reference}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Payment initialization failed: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        error.response?.data || 'Payment initialization failed',
        error.response?.status || 500,
      );
    }
  }

  async verifyPayment(
    reference: string,
  ): Promise<PaystackVerificationResponse> {
    try {
      this.logger.log(`Verifying payment with reference: ${reference}`);

      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      const verificationData = response.data as PaystackVerificationResponse;

      // If payment was successful, update the bill status
      if (
        verificationData.status &&
        verificationData.data.status === 'success'
      ) {
        const billId = verificationData.data.metadata?.bill_id;
        if (billId) {
          await this.billingService.payBill(billId, {
            Payment_Method: PaymentMethod.Mobile_Money, // Paystack payment
          });
          this.logger.log(
            `Bill ${billId} marked as paid after successful payment verification`,
          );
        }
      }

      this.logger.log(
        `Payment verification completed: ${verificationData.data.status}`,
      );
      return verificationData;
    } catch (error) {
      this.logger.error(
        `Payment verification failed: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        error.response?.data || 'Payment verification failed',
        error.response?.status || 500,
      );
    }
  }

  async initializeBillPayment(
    billId: number,
    patientEmail: string,
    callbackUrl?: string,
  ) {
    try {
      const bill = await this.billingService.findOne(billId);

      if (bill.Payment_Status === 'Paid') {
        throw new HttpException('Bill has already been paid', 400);
      }

      // Convert KES to kobo (multiply by 100)
      const amountInKobo = Math.round(bill.Total_Amount * 100);

      const paymentData: PaystackInitializeData = {
        email: patientEmail,
        amount: amountInKobo,
        reference: `bill_${billId}_${Date.now()}`,
        callback_url: callbackUrl,
        metadata: {
          bill_id: billId,
          patient_id: bill.Patient_id,
          custom_fields: [
            {
              display_name: 'Bill ID',
              variable_name: 'bill_id',
              value: billId.toString(),
            },
            {
              display_name: 'Description',
              variable_name: 'description',
              value: bill.Description,
            },
          ],
        },
      };

      return await this.initializePayment(paymentData);
    } catch (error) {
      this.logger.error(
        `Bill payment initialization failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
