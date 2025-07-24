import { Module } from '@nestjs/common';
import { PharmacyInventoryService } from './pharmacy_inventory.service';
import { PharmacyInventoryController } from './pharmacy_inventory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PharmacyInventory } from './entities/pharmacy_inventory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PharmacyInventory])
  ],
  controllers: [PharmacyInventoryController],
  providers: [PharmacyInventoryService],
})
export class PharmacyInventoryModule {}
