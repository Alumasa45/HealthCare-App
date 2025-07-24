import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePrescriptionItemDto } from './dto/create-prescription_item.dto';
import { UpdatePrescriptionItemDto } from './dto/update-prescription_item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PrescriptionItem } from './entities/prescription_item.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PrescriptionItemsService {
  private readonly logger = new Logger(PrescriptionItemsService.name);

  constructor(
    @InjectRepository(PrescriptionItem)
    private readonly prescriptionItemRepository: Repository<PrescriptionItem>,
  ) {}

  private createPrescriptionItem(dto: CreatePrescriptionItemDto): PrescriptionItem {
    return this.prescriptionItemRepository.create({
      Prescription_id: dto.Prescription_id,
      Medicine_id: dto.Medicine_id,
      Quantity_Prescribed: dto.Quantity_Prescribed,
      Dosage_Instructions: dto.Dosage_Instructions,
      Frequency: dto.Frequency,
      Duration: dto.Duration,
      Quantity_Dispensed: dto.Quantity_Dispensed,
      Unit_Price: dto.Unit_Price,
      Total_Price: dto.Total_Price,
      Substitution_Allowed: dto.Substitution_Allowed,
    } as Partial<PrescriptionItem>);
  }

  async create(
    createPrescriptionItemDto: CreatePrescriptionItemDto,
  ): Promise<PrescriptionItem> {
    try {

      if (!createPrescriptionItemDto.Prescription_id || !createPrescriptionItemDto.Medicine_id) {
            throw new BadRequestException('Prescription ID and Medicine ID are required');
        }

      const item = this.createPrescriptionItem(createPrescriptionItemDto);
      const savedItem = await this.prescriptionItemRepository.save(item);

      return savedItem;
    } catch (error) {
      this.logger.error('Failed to create prescription item,', error.stack);
      throw new BadRequestException({
        message: 'Failed to create prescription item.',
        error: error.message,
      });
    }
  }

  async findAll(): Promise<PrescriptionItem[]> {
    try {
      const items = await this.prescriptionItemRepository.find();
      this.logger.log(
        `Retrieved ${items.length} prescription items successfully.`,
      );
      return items;
    } catch (error) {
      this.logger.error('Failed to retrieve prescription items', error.stack);
      throw new BadRequestException('Failed to retrieve prescription items.');
    }
  }

  async findOne(Item_id: number): Promise<PrescriptionItem> {
    try {
      const item = await this.prescriptionItemRepository.findOne({
        where: { Item_id },
      });
      if (!item) {
        this.logger.warn(`Prescription item with Id ${Item_id}`);
        throw new NotFoundException('⚠ Prescription item not found!');
      }
      return item;
    } catch (error) {
      this.logger.error(`Failed to find prescription item with Id ${Item_id}`);
      throw new BadRequestException('Failed to find prescription item..');
    }
  }

  async update(
    Item_id: number,
    updatePrescriptionItemDto: UpdatePrescriptionItemDto,
  ): Promise<PrescriptionItem> {
    try {
      const item = await this.findOne(Item_id);
      Object.assign(item, updatePrescriptionItemDto);
      const updatedItem = await this.prescriptionItemRepository.save(item);
      this.logger.log(
        `Prescription item with Id ${Item_id} updated successfully!`,
      );
      return updatedItem;
    } catch (error) {
      this.logger.error(
        `Failed to update prescription items info with Id ${Item_id}`,
        error.stack,
      );
      throw new BadRequestException(
        'Failed to update prescription items info.',
      );
    }
  }

  async delete(Item_id: number): Promise<{ message: string }> {
    try {
      const item = await this.findOne(Item_id);
      await this.prescriptionItemRepository.remove(item);
      this.logger.log(`Prescription items deleted with ID: ${Item_id}`);
      return { message: 'Prescription items deleted successfully.' };
    } catch (error) {
      this.logger.error(
        `Failed to delete prescription items with ID: ${Item_id}`,
        error.stack,
      );
      throw new BadRequestException('Failed to remove prescription items.');
    }
  }
}
