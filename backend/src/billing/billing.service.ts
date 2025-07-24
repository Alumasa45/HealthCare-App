import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateBillingDto } from './dto/create-billing.dto';
import { PayBillDto, UpdateBillingDto } from './dto/update-billing.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Bill, PaymentStatus } from './entities/billing.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectRepository(Bill)
    private readonly billingRepository: Repository<Bill>,
  ) {}

  async create(createBillingDto: CreateBillingDto): Promise<Bill> {
    try {
      const bill = this.billingRepository.create({
        ...createBillingDto,
        Payment_Status: createBillingDto.Payment_Status || PaymentStatus.Pending,
        Discount_Amount: createBillingDto.Discount_Amount || 0,
        Created_at: new Date(),
        Updated_at: new Date(),
      });
      
      const savedBill = await this.billingRepository.save(bill);
      return savedBill;
    } catch (error) {
      this.logger.error('Failed to create bill', error.stack);
      throw new BadRequestException({ message: 'Failed to create bill', error: error.message });
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

  async update(Bill_id: number, updateBillingDto: UpdateBillingDto): Promise<Bill> {
    try {
      const bill = await this.findOne(Bill_id);
      Object.assign(bill, updateBillingDto, { Updated_at: new Date() });
      const updatedBill = await this.billingRepository.save(bill);
      this.logger.log(`Bill updated with ID: ${Bill_id}`);
      return updatedBill;
    } catch (error) {
      this.logger.error(`Failed to update bill with ID: ${Bill_id}`, error.stack);
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
        Updated_at: new Date()
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
      return { message: 'Bill deleted successfully.' };
    } catch (error) {
      this.logger.error(`Failed to delete bill with ID: ${Bill_id}`, error.stack);
      throw new BadRequestException('Failed to delete bill');
    }
  }
}