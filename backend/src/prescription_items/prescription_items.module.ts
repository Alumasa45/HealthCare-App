import { Module } from '@nestjs/common';
import { PrescriptionItemsService } from './prescription_items.service';
import { PrescriptionItemsController } from './prescription_items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrescriptionItem } from './entities/prescription_item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PrescriptionItem])
  ],
  controllers: [PrescriptionItemsController],
  providers: [PrescriptionItemsService],
})
export class PrescriptionItemsModule {}
