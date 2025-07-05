import { Module } from '@nestjs/common';
import { MedicineOrdersService } from './medicine_orders.service';
import { MedicineOrdersController } from './medicine_orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicineOrder } from './entities/medicine_order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicineOrder])
  ],
  controllers: [MedicineOrdersController],
  providers: [MedicineOrdersService],
})
export class MedicineOrdersModule {}
