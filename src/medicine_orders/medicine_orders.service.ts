import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateMedicineOrderDto } from './dto/create-medicine_order.dto';
import { UpdateMedicineOrderDto } from './dto/update-medicine_order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicineOrder } from './entities/medicine_order.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MedicineOrdersService {
  private readonly logger = new Logger(MedicineOrdersService.name)
    
      constructor(
        @InjectRepository(MedicineOrder)
        private readonly medicineOrderRepository: Repository<MedicineOrder>,
      ) {}
    
      async create(createMedicineOrderDto: CreateMedicineOrderDto): Promise<MedicineOrder> {
        try {
          const order = this.medicineOrderRepository.create({
            ...createMedicineOrderDto,
            Created_at: createMedicineOrderDto.Created_at || new Date(),
            Updated_at: createMedicineOrderDto.Updated_at || new Date(),
          });
          const savedOrder = await this.medicineOrderRepository.save(order);
          return savedOrder;
        } catch (error) {
          this.logger.error('Failed to create order', error.stack);
          throw new BadRequestException({message: 'Failed to create order.', error: error.message});
        }
      }
    
    async findAll(): Promise<MedicineOrder[]> {
    try {
      const orders = await this.medicineOrderRepository.find();
      this.logger.log(`Retrieved ${orders.length} orders successfully.`);
      return orders;
    } catch (error) {
      this.logger.error('Failed to retrieve orders', error.stack);
      throw new BadRequestException('Failed to retrieve orders.')
     }
    }
    
    async findOne(Order_id: number): Promise<MedicineOrder> {
      try {
        const order = await this.medicineOrderRepository.findOne({ where: {Order_id} });
        if(!order) {
          this.logger.warn(`Order with Id ${Order_id}`);
          throw new NotFoundException('⚠ Order not found!')
        }
        return order;
      } catch (error) {
        this.logger.error(`Failed to find order with Id ${Order_id}`);
        throw new BadRequestException('Failed to find order.')
      }
      }
    
    async update(Order_id: number, updateMedicineOrderDto: UpdateMedicineOrderDto): Promise <MedicineOrder> {
      try {
        const order = await this.findOne(Order_id);
        Object.assign(order, updateMedicineOrderDto);
        const updatedOrder = await this.medicineOrderRepository.save(order);
        this.logger.log(`Order with Id ${Order_id} updated successfully!`);
        return updatedOrder;
      } catch (error) {
        this.logger.error(`Failed to update order info with Id ${Order_id}`, error.stack);
        throw new BadRequestException('Failed to update order info.')
      }
      }
    
    async delete(Order_id: number): Promise<{ message: string }> {
        try {
          const order = await this.findOne(Order_id);
          await this.medicineOrderRepository.remove(order);
          this.logger.log(`Order deleted with ID: ${Order_id}`);
          return { message: 'Order deleted successfully.' };
        } catch (error) {
          this.logger.error(`Failed to delete order with ID: ${Order_id}`, error.stack);
          throw new BadRequestException('Failed to remove medicine order.');
        }
    
      }
}
