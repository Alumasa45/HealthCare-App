import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Medicine } from './entities/medicine.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MedicinesService {
  private readonly logger = new Logger(MedicinesService.name)
      
        constructor(
          @InjectRepository(Medicine)
          private readonly medicineRepository: Repository<Medicine>,
        ) {}
      
        async create(createMedicineDto: CreateMedicineDto): Promise<Medicine> {
    try {
        const medicine: Medicine = this.medicineRepository.create({
            ...createMedicineDto,
            Created_at: new Date(), 
            Updated_at: new Date() 
        });
        
        const savedMedicine = await this.medicineRepository.save(medicine);
        return savedMedicine;
    } catch (error) {
        this.logger.error('Failed to add medicine', error.stack);
        throw new BadRequestException({
            message: 'Failed to add medicine',
            error: error.message
        });
    }
}
      
      async findAll(): Promise<Medicine[]> {
      try {
        const medicines = await this.medicineRepository.find();
        this.logger.log(`Retrieved ${medicines.length} medicines successfully.`);
        return medicines;
      } catch (error) {
        this.logger.error('Failed to retrieve medicines', error.stack);
        throw new BadRequestException('Failed to retrieve medicines.')
       }
      }
      
      async findOne(Medicine_id: number): Promise<Medicine> {
        try {
          const medicine = await this.medicineRepository.findOne({ where: {Medicine_id} });
          if(!medicine) {
            this.logger.warn(`Medicine with Id ${Medicine_id}`);
            throw new NotFoundException('⚠ Medicine not found!')
          }
          return medicine;
        } catch (error) {
          this.logger.error(`Failed to find medicine with Id ${Medicine_id}`);
          throw new BadRequestException('Failed to find medicine.')
        }
        }
      
      async update(Medicine_id: number, updateMedicineDto: UpdateMedicineDto): Promise <Medicine> {
        try {
          const medicine = await this.findOne(Medicine_id);
          Object.assign(medicine, updateMedicineDto);
          const updatedMedicine = await this.medicineRepository.save(medicine);
          this.logger.log(`Medicine with Id ${Medicine_id} updated successfully!`);
          return updatedMedicine;
        } catch (error) {
          this.logger.error(`Failed to update medicine info with Id ${Medicine_id}`, error.stack);
          throw new BadRequestException('Failed to update medicine info.')
        }
        }
      
      async delete(Medicine_id: number): Promise<{ message: string }> {
          try {
            const medicine = await this.findOne(Medicine_id);
            await this.medicineRepository.remove(medicine);
            this.logger.log(`Medicine deleted with ID: ${Medicine_id}`);
            return { message: 'Medicine deleted successfully.' };
          } catch (error) {
            this.logger.error(`Failed to delete medicine with ID: ${Medicine_id}`, error.stack);
            throw new BadRequestException('Failed to remove medicine.');
          }
      
        }
}
