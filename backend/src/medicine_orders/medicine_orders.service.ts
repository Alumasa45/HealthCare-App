import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateMedicineOrderDto } from './dto/create-medicine_order.dto';
import { UpdateMedicineOrderDto } from './dto/update-medicine_order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicineOrder } from './entities/medicine_order.entity';
import { MedicineOrderItem } from './entities/medicine_order_item.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class MedicineOrdersService {
  private readonly logger = new Logger(MedicineOrdersService.name);

  constructor(
    @InjectRepository(MedicineOrder)
    private readonly medicineOrderRepository: Repository<MedicineOrder>,
    @InjectRepository(MedicineOrderItem)
    private readonly medicineOrderItemRepository: Repository<MedicineOrderItem>,
    private dataSource: DataSource,
  ) {}

  async create(
    createMedicineOrderDto: CreateMedicineOrderDto,
  ): Promise<MedicineOrder> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create the main order
      const order = this.medicineOrderRepository.create({
        Patient_id: createMedicineOrderDto.Patient_id,
        Pharmacy_id: createMedicineOrderDto.Pharmacy_id,
        Prescription_id: createMedicineOrderDto.Prescription_id,
        Total_Amount: createMedicineOrderDto.Total_Amount,
        Order_Status: createMedicineOrderDto.Order_Status as any,
        Payment_Status: createMedicineOrderDto.Payment_Status as any,
        Payment_Method: createMedicineOrderDto.Payment_Method,
        Delivery_Address: createMedicineOrderDto.Delivery_Address,
        Delivery_Date: createMedicineOrderDto.Delivery_Date,
        Notes: createMedicineOrderDto.Notes,
      });

      const savedOrder = await queryRunner.manager.save(MedicineOrder, order);

      // Create order items
      if (
        createMedicineOrderDto.orderItems &&
        createMedicineOrderDto.orderItems.length > 0
      ) {
        const orderItems = createMedicineOrderDto.orderItems.map((item) =>
          this.medicineOrderItemRepository.create({
            Order_id: savedOrder.Order_id,
            Medicine_id: item.Medicine_id,
            Quantity: item.Quantity,
            Unit_Price: item.Unit_Price,
            Total_Price: item.Total_Price,
          }),
        );

        await queryRunner.manager.save(MedicineOrderItem, orderItems);
      }

      await queryRunner.commitTransaction();

      this.logger.log(`Order created with ID: ${savedOrder.Order_id}`);
      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to create order', error.stack);
      throw new BadRequestException({
        message: 'Failed to create order.',
        error: error.message,
      });
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<MedicineOrder[]> {
    try {
      const orders = await this.medicineOrderRepository.find({
        order: { Order_Date: 'DESC' },
      });
      this.logger.log(`Retrieved ${orders.length} orders successfully.`);
      return orders;
    } catch (error) {
      this.logger.error('Failed to retrieve orders', error.stack);
      throw new BadRequestException('Failed to retrieve orders.');
    }
  }

  async findByPharmacy(Pharmacy_id: number): Promise<MedicineOrder[]> {
    try {
      const orders = await this.medicineOrderRepository.find({
        where: { Pharmacy_id },
        order: { Order_Date: 'DESC' },
      });
      this.logger.log(
        `Retrieved ${orders.length} orders for pharmacy ${Pharmacy_id} successfully.`,
      );
      return orders;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve orders for pharmacy ${Pharmacy_id}`,
        error.stack,
      );
      throw new BadRequestException('Failed to retrieve orders for pharmacy.');
    }
  }

  async findByPatient(Patient_id: number): Promise<MedicineOrder[]> {
    try {
      const orders = await this.medicineOrderRepository.find({
        where: { Patient_id },
        order: { Order_Date: 'DESC' },
      });
      this.logger.log(
        `Retrieved ${orders.length} orders for patient ${Patient_id} successfully.`,
      );
      return orders;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve orders for patient ${Patient_id}`,
        error.stack,
      );
      throw new BadRequestException('Failed to retrieve orders for patient.');
    }
  }

  async findOne(id: number): Promise<MedicineOrder> {
    try {
      const order = await this.medicineOrderRepository.findOne({
        where: { Order_id: id },
      });
      if (!order) {
        this.logger.warn(`Order with Id ${id} not found`);
        throw new NotFoundException('⚠ Order not found!');
      }
      return order;
    } catch (error) {
      this.logger.error(`Failed to find order with Id ${id}`, error.stack);
      throw new BadRequestException('Failed to retrieve order.');
    }
  }

  async update(
    id: number,
    updateMedicineOrderDto: UpdateMedicineOrderDto,
  ): Promise<MedicineOrder> {
    try {
      const order = await this.findOne(id);
      Object.assign(order, updateMedicineOrderDto);
      const updatedOrder = await this.medicineOrderRepository.save(order);
      this.logger.log(`Order updated with Id ${id} successfully.`);
      return updatedOrder;
    } catch (error) {
      this.logger.error(`Failed to update order with Id ${id}`, error.stack);
      throw new BadRequestException('Failed to update order.');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const order = await this.findOne(id);
      await this.medicineOrderRepository.remove(order);
      this.logger.log(`Order with Id ${id} deleted successfully.`);
      return { message: 'Order deleted successfully.' };
    } catch (error) {
      this.logger.error(`Failed to delete order with Id ${id}`, error.stack);
      throw new BadRequestException('Failed to delete order.');
    }
  }

  async updateOrderStatus(id: number, status: string): Promise<MedicineOrder> {
    try {
      const order = await this.findOne(id);
      order.Order_Status = status as any;
      const updatedOrder = await this.medicineOrderRepository.save(order);
      this.logger.log(`Order status updated for Id ${id} to ${status}.`);
      return updatedOrder;
    } catch (error) {
      this.logger.error(
        `Failed to update order status for Id ${id}`,
        error.stack,
      );
      throw new BadRequestException('Failed to update order status.');
    }
  }

  async updatePaymentStatus(
    id: number,
    paymentStatus: string,
    paymentMethod?: string,
  ): Promise<MedicineOrder> {
    try {
      const order = await this.findOne(id);
      order.Payment_Status = paymentStatus as any;
      if (paymentMethod) {
        order.Payment_Method = paymentMethod;
      }
      const updatedOrder = await this.medicineOrderRepository.save(order);
      this.logger.log(
        `Payment status updated for order Id ${id} to ${paymentStatus}.`,
      );
      return updatedOrder;
    } catch (error) {
      this.logger.error(
        `Failed to update payment status for Id ${id}`,
        error.stack,
      );
      throw new BadRequestException('Failed to update payment status.');
    }
  }
}
