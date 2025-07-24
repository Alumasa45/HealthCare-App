import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateMedicalRecordDto } from './dto/create-medical_record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical_record.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicalRecord } from './entities/medical_record.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MedicalRecordsService {
  private readonly logger = new Logger(MedicalRecordsService.name);

  constructor(
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepository: Repository<MedicalRecord>,
  ) {}

  async create(createMedicalRecordDto: CreateMedicalRecordDto): Promise<MedicalRecord> {
    try {
      const medicalRecord = this.medicalRecordRepository.create({
        ...createMedicalRecordDto,
        Created_at: createMedicalRecordDto.Created_at || new Date(),
        Updated_at: createMedicalRecordDto.Updated_at || new Date(),
      });
      const savedmedicalRecord = await this.medicalRecordRepository.save(medicalRecord);
      return savedmedicalRecord;
    } catch (error) {
      this.logger.error('Failed to create medical record', error.stack);
      throw new BadRequestException({ message: 'Failed to create medical Record', error: error.message });
    }
  }

async findAll(): Promise<MedicalRecord[]> {
try {
  const medicalRecords = await this.medicalRecordRepository.find();
  this.logger.log(`Retrieved ${medicalRecords.length} medical records.`);
  return medicalRecords;
} catch (error) {
  this.logger.error('Failed to retrieve medical records', error.stack);
  throw new BadRequestException('Failed to retrieve medical records.')
 }
}

async findOne(Record_id: number): Promise<MedicalRecord> {
    try {
      const medicalRecord = await this.medicalRecordRepository.findOneBy({ Record_id });
      if (!medicalRecord) {
        this.logger.warn(`Record not found with ID: ${Record_id}`);
        throw new NotFoundException('⚠ Record not found!');
      }
      return medicalRecord;
    } catch (error) {
      this.logger.error(`Failed to find record with ID: ${Record_id}`, error.stack);
      throw new BadRequestException('Failed to retrieve record');
    }
  }

  async update(Record_id: number, updatemedicalRecordDto: UpdateMedicalRecordDto): Promise<MedicalRecord> {
      try {
        const Record = await this.findOne(Record_id);
        Object.assign(Record, updatemedicalRecordDto);
        const updatedRecord = await this.medicalRecordRepository.save(Record);
        this.logger.log(`Record updated with ID: ${Record_id}`);
        return updatedRecord;
      } catch (error) {
        this.logger.error(`Failed to update record with ID: ${Record_id}`, error.stack);
        throw new BadRequestException('Failed to update Medical record.');
      }
    }

  async remove(Record_id: number): Promise<{ message: string }> {
    try {
      const Record = await this.findOne(Record_id);
      await this.medicalRecordRepository.remove(Record);
      this.logger.log(`Medical record deleted with ID: ${Record_id}`);
      return { message: 'Medical Record deleted successfully.' };
    } catch (error) {
      this.logger.error(`Failed to delete Record with ID: ${Record_id}`, error.stack);
      throw new BadRequestException('⚠ Failed to delete Medical record!');
    }
  }
}
