import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bill } from './entities/billing.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { MedicineOrder } from '../medicine_orders/entities/medicine_order.entity';
import { Prescription } from '../prescriptions/entities/prescription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bill, Appointment, MedicineOrder, Prescription]),
  ],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
