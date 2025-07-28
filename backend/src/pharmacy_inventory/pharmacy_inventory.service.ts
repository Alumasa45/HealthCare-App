import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePharmacyInventoryDto } from './dto/create-pharmacy_inventory.dto';
import { UpdatePharmacyInventoryDto } from './dto/update-pharmacy_inventory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PharmacyInventory } from './entities/pharmacy_inventory.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PharmacyInventoryService {
  private readonly logger = new Logger(PharmacyInventoryService.name);

  constructor(
    @InjectRepository(PharmacyInventory)
    private readonly pharmacyInventoryRepository: Repository<PharmacyInventory>,
  ) {}

  async create(
    createPharmacyInventoryDto: CreatePharmacyInventoryDto,
  ): Promise<PharmacyInventory> {
    try {
      const inventory = this.pharmacyInventoryRepository.create({
        ...createPharmacyInventoryDto,
        Created_at: createPharmacyInventoryDto.Created_at || new Date(),
        Updated_at: createPharmacyInventoryDto.Updated_at || new Date(),
      });
      const savedInventory =
        await this.pharmacyInventoryRepository.save(inventory);
      return savedInventory;
    } catch (error) {
      this.logger.error('Failed to create new inventory', error.stack);
      throw new BadRequestException({
        message: 'Failed to create inventory.',
        error: error.message,
      });
    }
  }

  async findAll(): Promise<PharmacyInventory[]> {
    try {
      const inventories = await this.pharmacyInventoryRepository.find({
        relations: ['medicine', 'pharmacy'],
      });
      this.logger.log(
        `Retrieved ${inventories.length} inventories successfully.`,
      );
      return inventories;
    } catch (error) {
      this.logger.error('Failed to retrieve inventories', error.stack);
      throw new BadRequestException('Failed to retrieve inventories.');
    }
  }

  async findByPharmacy(Pharmacy_id: number): Promise<PharmacyInventory[]> {
    try {
      const inventories = await this.pharmacyInventoryRepository.find({
        where: { Pharmacy_id },
        relations: ['medicine', 'pharmacy'],
      });
      this.logger.log(
        `Retrieved ${inventories.length} inventories for pharmacy ${Pharmacy_id} successfully.`,
      );
      return inventories;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve inventories for pharmacy ${Pharmacy_id}`,
        error.stack,
      );
      throw new BadRequestException(
        'Failed to retrieve inventories for pharmacy.',
      );
    }
  }

  async findOne(Inventory_id: number): Promise<PharmacyInventory> {
    try {
      const inventory = await this.pharmacyInventoryRepository.findOne({
        where: { Inventory_id },
        relations: ['medicine', 'pharmacy'],
      });
      if (!inventory) {
        this.logger.warn(`Inventory with Id ${Inventory_id}`);
        throw new NotFoundException('⚠ Inventory not found!');
      }
      return inventory;
    } catch (error) {
      this.logger.error(`Failed to find inventory with Id ${Inventory_id}`);
      throw new BadRequestException('Failed to find inventory.');
    }
  }

  async update(
    Inventory_id: number,
    updatePharmacyInventoryDto: UpdatePharmacyInventoryDto,
  ): Promise<PharmacyInventory> {
    try {
      const inventory = await this.findOne(Inventory_id);
      Object.assign(inventory, updatePharmacyInventoryDto);
      const updatedInventory =
        await this.pharmacyInventoryRepository.save(inventory);
      this.logger.log(
        `Inventory with Id ${Inventory_id} updated successfully!`,
      );
      return updatedInventory;
    } catch (error) {
      this.logger.error(
        `Failed to update inventory info with Id ${Inventory_id}`,
        error.stack,
      );
      throw new BadRequestException('Failed to update inventory info.');
    }
  }

  async delete(Inventory_id: number): Promise<{ message: string }> {
    try {
      const inventory = await this.findOne(Inventory_id);
      await this.pharmacyInventoryRepository.remove(inventory);
      this.logger.log(`Inventory deleted with ID: ${Inventory_id}`);
      return { message: 'Inventory deleted successfully.' };
    } catch (error) {
      this.logger.error(
        `Failed to delete inventory with ID: ${Inventory_id}`,
        error.stack,
      );
      throw new BadRequestException('Failed to remove inventory.');
    }
  }
}
