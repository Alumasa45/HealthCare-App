import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pharmacy } from './entities/pharmacy.entity';
import { Repository } from 'typeorm';


@Injectable()
export class PharmaciesService {
  private readonly logger = new Logger(PharmaciesService.name)
    
      constructor(
        @InjectRepository(Pharmacy)
        private readonly pharmacyRepository: Repository<Pharmacy>,
      ) {}
    
      async create(createPharmacyDto: CreatePharmacyDto): Promise<Pharmacy> {
        try {
          const pharmacy = this.pharmacyRepository.create({
            ...createPharmacyDto,
            Created_at: createPharmacyDto.Created_at || new Date(),
            Updated_at: createPharmacyDto.Updated_at || new Date(),
          });
          const savedPharmacy = await this.pharmacyRepository.save(pharmacy);
          return savedPharmacy;
        } catch (error) {
          this.logger.error('Failed to add pharmacy', error.stack);
          throw new BadRequestException({message: 'Failed to add pharmacy.', error: error.message});
        }
      }
    
    async findAll(): Promise<Pharmacy[]> {
    try {
      const pharmarcies = await this.pharmacyRepository.find();
      this.logger.log(`Retrieved ${pharmarcies.length} pharmacies successfully.`);
      return pharmarcies;
    } catch (error) {
      this.logger.error('Failed to retrieve pharmacies', error.stack);
      throw new BadRequestException('Failed to retrieve pharmacies.')
     }
    }
    
    async findOne(Pharmacy_id: number): Promise<Pharmacy> {
      try {
        const pharmacy = await this.pharmacyRepository.findOne({ where: {Pharmacy_id} });
        if(!pharmacy) {
          this.logger.warn(`Pharmacy with Id ${Pharmacy_id}`);
          throw new NotFoundException('⚠ Pharmacy not found!')
        }
        return pharmacy;
      } catch (error) {
        this.logger.error(`Failed to find pharmacy with Id ${Pharmacy_id}`);
        throw new BadRequestException('Failed to find pharmacy.')
      }
      }
    
    async update(Pharmacy_id: number, updatePharmacyDto: UpdatePharmacyDto): Promise <Pharmacy> {
      try {
        const pharmacy = await this.findOne(Pharmacy_id);
        Object.assign(pharmacy, updatePharmacyDto);
        const updatedPharmacy = await this.pharmacyRepository.save(pharmacy);
        this.logger.log(`Pharmacy with Id ${Pharmacy_id} updated successfully!`);
        return updatedPharmacy;
      } catch (error) {
        this.logger.error(`Failed to update pharmacy info with Id ${Pharmacy_id}`, error.stack);
        throw new BadRequestException('Failed to update pharmacy info.')
      }
      }
    
    async delete(Pharmacy_id: number): Promise<{ message: string }> {
        try {
          const pharmacy = await this.findOne(Pharmacy_id);
          await this.pharmacyRepository.remove(pharmacy);
          this.logger.log(`Pharmacy deleted with ID: ${Pharmacy_id}`);
          return { message: 'Pharmacy deleted successfully.' };
        } catch (error) {
          this.logger.error(`Failed to delete pharmacy with ID: ${Pharmacy_id}`, error.stack);
          throw new BadRequestException('Failed to remove pharmacy.');
        }
    
      }
}
