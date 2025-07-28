import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateBillingDto } from './dto/create-billing.dto';
import { PayBillDto, UpdateBillingDto } from './dto/update-billing.dto';
import { CalculateSessionBillDto } from './dto/calculate-session-bill.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Bill, PaymentStatus } from './entities/billing.entity';
import { Repository } from 'typeorm';
import { Appointment } from '../appointments/entities/appointment.entity';
import { MedicineOrder } from '../medicine_orders/entities/medicine_order.entity';
import { Prescription } from '../prescriptions/entities/prescription.entity';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectRepository(Bill)
    private readonly billingRepository: Repository<Bill>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(MedicineOrder)
    private readonly medicineOrderRepository: Repository<MedicineOrder>,
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
  ) {}

  async create(createBillingDto: CreateBillingDto): Promise<Bill> {
    try {
      const bill = this.billingRepository.create({
        ...createBillingDto,
        Payment_Status:
          createBillingDto.Payment_Status || PaymentStatus.Pending,
        Discount_Amount: createBillingDto.Discount_Amount || 0,
        Created_at: new Date(),
        Updated_at: new Date(),
      });

      const savedBill = await this.billingRepository.save(bill);
      this.logger.log(`Bill created with ID: ${savedBill.Bill_id}`);
      return savedBill;
    } catch (error) {
      this.logger.error('Failed to create bill', error.stack);
      throw new BadRequestException({
        message: 'Failed to create bill',
        error: error.message,
      });
    }
  }

  async findAll(User_id?: number): Promise<Bill[]> {
    try {
      const query = User_id ? { where: { Patient_id: User_id } } : {};
      const bills = await this.billingRepository.find(query);
      this.logger.log(`Retrieved ${bills.length} bills`);
      return bills;
    } catch (error) {
      this.logger.error('Failed to retrieve bills', error.stack);
      throw new BadRequestException('Failed to retrieve bills');
    }
  }

  async findOne(Bill_id: number): Promise<Bill> {
    try {
      const bill = await this.billingRepository.findOneBy({ Bill_id });
      if (!bill) {
        this.logger.warn(`Bill not found with ID: ${Bill_id}`);
        throw new NotFoundException('⚠ Bill not found!');
      }
      return bill;
    } catch (error) {
      this.logger.error(`Failed to find bill with ID: ${Bill_id}`, error.stack);
      throw new BadRequestException('Failed to retrieve bill');
    }
  }

  async update(
    Bill_id: number,
    updateBillingDto: UpdateBillingDto,
  ): Promise<Bill> {
    try {
      const bill = await this.findOne(Bill_id);
      Object.assign(bill, updateBillingDto, { Updated_at: new Date() });
      const updatedBill = await this.billingRepository.save(bill);
      this.logger.log(`Bill updated with ID: ${Bill_id}`);
      return updatedBill;
    } catch (error) {
      this.logger.error(
        `Failed to update bill with ID: ${Bill_id}`,
        error.stack,
      );
      throw new BadRequestException('Failed to update bill');
    }
  }

  async payBill(Bill_id: number, payBillDto: PayBillDto): Promise<Bill> {
    try {
      const bill = await this.findOne(Bill_id);

      if (bill.Payment_Status === PaymentStatus.Paid) {
        throw new BadRequestException('Bill has already been paid');
      }

      Object.assign(bill, {
        Payment_Status: PaymentStatus.Paid,
        Payment_Method: payBillDto.Payment_Method,
        Payment_Date: new Date(),
        Updated_at: new Date(),
      });

      const updatedBill = await this.billingRepository.save(bill);
      this.logger.log(`Bill paid with ID: ${Bill_id}`);
      return updatedBill;
    } catch (error) {
      this.logger.error(`Failed to pay bill with ID: ${Bill_id}`, error.stack);
      throw new BadRequestException('Failed to process payment');
    }
  }

  async remove(Bill_id: number): Promise<{ message: string }> {
    try {
      const bill = await this.findOne(Bill_id);
      await this.billingRepository.remove(bill);
      this.logger.log(`Bill deleted with ID: ${Bill_id}`);
      return { message: 'Bill deleted successfully' };
    } catch (error) {
      this.logger.error(
        `Failed to delete bill with ID: ${Bill_id}`,
        error.stack,
      );
      throw new BadRequestException('Failed to delete bill');
    }
  }

  async calculateSessionBill(
    calculateSessionBillDto: CalculateSessionBillDto,
  ): Promise<{
    totalAmount: number;
    breakdown: {
      consultationFee: number;
      medicineOrdersTotal: number;
      prescriptionsTotal: number;
      taxAmount: number;
    };
    description: string;
  }> {
    try {
      let consultationFee = 0;
      let medicineOrdersTotal = 0;
      let prescriptionsTotal = 0;

      if (calculateSessionBillDto.Appointment_id) {
        const appointment = await this.appointmentRepository.findOne({
          where: { Appointment_id: calculateSessionBillDto.Appointment_id },
        });

        if (appointment) {
          consultationFee = calculateSessionBillDto.Consultation_Fee || 2000; // Default 2000 KES.
        }
      } else if (calculateSessionBillDto.Consultation_Fee) {
        consultationFee = calculateSessionBillDto.Consultation_Fee;
      }

      //total medicine orders.
      if (
        calculateSessionBillDto.Medicine_Orders &&
        calculateSessionBillDto.Medicine_Orders.length > 0
      ) {
        for (const orderItem of calculateSessionBillDto.Medicine_Orders) {
          const medicineOrder = await this.medicineOrderRepository.findOne({
            where: { Order_id: orderItem.Order_id },
          });

          if (medicineOrder) {
            medicineOrdersTotal += medicineOrder.Total_Amount;
          } else {
            medicineOrdersTotal += orderItem.Total_Amount;
          }
        }
      }

      // prescriptions total.
      if (
        calculateSessionBillDto.Prescription_ids &&
        calculateSessionBillDto.Prescription_ids.length > 0
      ) {
        for (const prescriptionId of calculateSessionBillDto.Prescription_ids) {
          const prescription = await this.prescriptionRepository.findOne({
            where: { Prescription_id: prescriptionId },
          });

          if (prescription) {
            prescriptionsTotal += prescription.Total_Amount;
          }
        }
      }

      const subtotal =
        consultationFee + medicineOrdersTotal + prescriptionsTotal;
      const taxAmount = subtotal * 0.16; // 16% VAT.
      const totalAmount = subtotal + taxAmount;

      const breakdown = {
        consultationFee,
        medicineOrdersTotal,
        prescriptionsTotal,
        taxAmount: Math.round(taxAmount * 100) / 100,
      };

      const description = [
        consultationFee > 0 ? `Consultation Fee: KES ${consultationFee}` : '',
        medicineOrdersTotal > 0
          ? `Medicine Orders: KES ${medicineOrdersTotal}`
          : '',
        prescriptionsTotal > 0
          ? `Prescriptions: KES ${prescriptionsTotal}`
          : '',
        calculateSessionBillDto.Additional_Description || '',
      ]
        .filter(Boolean)
        .join(', ');

      this.logger.log(
        `Session bill calculated for patient ${calculateSessionBillDto.Patient_id}: KES ${totalAmount}`,
      );

      return {
        totalAmount: Math.round(totalAmount * 100) / 100,
        breakdown,
        description,
      };
    } catch (error) {
      this.logger.error('Failed to calculate session bill', error.stack);
      throw new BadRequestException('Failed to calculate session bill');
    }
  }

  async createSessionBill(
    calculateSessionBillDto: CalculateSessionBillDto,
  ): Promise<Bill> {
    try {
      const calculation = await this.calculateSessionBill(
        calculateSessionBillDto,
      );

      const billData: CreateBillingDto = {
        Patient_id: calculateSessionBillDto.Patient_id,
        Appointment_id: calculateSessionBillDto.Appointment_id,
        Bill_Date: new Date(),
        Due_Date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        Amount: calculation.totalAmount - calculation.breakdown.taxAmount,
        Tax_Amount: calculation.breakdown.taxAmount,
        Discount_Amount: 0,
        Total_Amount: calculation.totalAmount,
        Payment_Status: PaymentStatus.Pending,
        Description:
          calculation.description || 'Healthcare services session bill',
      };

      return await this.create(billData);
    } catch (error) {
      this.logger.error('Failed to create session bill', error.stack);
      throw new BadRequestException('Failed to create session bill');
    }
  }
}
