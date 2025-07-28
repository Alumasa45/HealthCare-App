import { Module } from '@nestjs/common';
import { MedicineOrdersService } from './medicine_orders.service';
import { MedicineOrdersController } from './medicine_orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicineOrder } from './entities/medicine_order.entity';
import { MedicineOrderItem } from './entities/medicine_order_item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedicineOrder, MedicineOrderItem])],
  controllers: [MedicineOrdersController],
  providers: [MedicineOrdersService],
  exports: [MedicineOrdersService], // Export for use in billing
})
export class MedicineOrdersModule {}
