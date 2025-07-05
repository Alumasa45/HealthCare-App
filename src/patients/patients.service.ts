import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name)

  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    try {
      const patient = this.patientRepository.create({
        ...createPatientDto,
        Created_at: createPatientDto.Created_at || new Date()
      });
      const savedPatient = await this.patientRepository.save(patient);
      return savedPatient;
    } catch (error) {
      this.logger.error('Failed to create patient', error.stack);
      throw new BadRequestException({message: 'Failed to create Patient.', error: error.message});
    }
  }

async findAll(): Promise<Patient[]> {
try {
  const patients = await this.patientRepository.find();
  this.logger.log(`Retrieved ${patients.length} patients.`);
  return patients;
} catch (error) {
  this.logger.error('Failed to retrieve patients', error.stack);
  throw new BadRequestException('Failed to retrieve patients.')
 }
}

async findOne(Patient_id: number): Promise<Patient> {
  try {
    const patient = await this.patientRepository.findOne({ where: {User_id: Patient_id} });
    if(!patient) {
      this.logger.warn(`Patient with Id ${Patient_id}`);
      throw new NotFoundException('⚠ Patient not found!')
    }
    return patient;
  } catch (error) {
    this.logger.error(`Failed to find patient with Id ${Patient_id}`);
    throw new BadRequestException('Failed to find Patient.')
  }
  }

async update(Patient_id: number, updatePatientDto: UpdatePatientDto): Promise <Patient> {
  try {
    const patient = await this.findOne(Patient_id);
    Object.assign(patient, updatePatientDto);
    const updatedPatient = await this.patientRepository.save(patient);
    this.logger.log(`🎉Patient with Id ${Patient_id} updated successfully!`);
    return updatedPatient;
  } catch (error) {
    this.logger.error(`Failed to update patient info with Id ${Patient_id}, error.stack`);
    throw new BadRequestException('Failed to update patient info.')
  }
  }

async delete(Patient_id: number): Promise<{ message: string }> {
    try {
      const patient = await this.findOne(Patient_id);
      await this.patientRepository.remove(patient);
      this.logger.log(`Patient deleted with ID: ${Patient_id}`);
      return { message: 'Patient deleted successfully.' };
    } catch (error) {
      this.logger.error(`Failed to delete patient with ID: ${Patient_id}`, error.stack);
      throw new BadRequestException('Failed to delete patient.');
    }

  }
}
