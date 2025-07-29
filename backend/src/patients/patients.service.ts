import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { Repository } from 'typeorm';
import { PatientProfileService } from './patient-profile.service';

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);

  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly patientProfileService: PatientProfileService,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    try {
      const patient = this.patientRepository.create({
        ...createPatientDto,
        Created_at: createPatientDto.Created_at || new Date(),
      });
      const savedPatient = await this.patientRepository.save(patient);
      return savedPatient;
    } catch (error) {
      this.logger.error('Failed to create patient', error.stack);
      throw new BadRequestException({
        message: 'Failed to create Patient.',
        error: error.message,
      });
    }
  }

  async findAll(): Promise<Patient[]> {
    try {
      const patients = await this.patientRepository.find({
        relations: ['user'], // Include user relations
      });
      this.logger.log(`Retrieved ${patients.length} patients.`);
      return patients;
    } catch (error) {
      this.logger.error('Failed to retrieve patients', error.stack);
      throw new BadRequestException('Failed to retrieve patients.');
    }
  }

  async findOne(Patient_id: number): Promise<Patient> {
    try {
      const patient = await this.patientRepository.findOne({
        where: { Patient_id },
      });
      if (!patient) {
        this.logger.warn(`Patient with Id ${Patient_id}`);
        throw new NotFoundException('⚠ Patient not found!');
      }
      return patient;
    } catch (error) {
      this.logger.error(`Failed to find patient with Id ${Patient_id}`);
      throw new BadRequestException('Failed to find Patient.');
    }
  }

  async update(
    Patient_id: number,
    updatePatientDto: UpdatePatientDto,
  ): Promise<Patient> {
    try {
      const patient = await this.findOne(Patient_id);
      Object.assign(patient, updatePatientDto);
      const updatedPatient = await this.patientRepository.save(patient);
      this.logger.log(`🎉Patient with Id ${Patient_id} updated successfully!`);
      return updatedPatient;
    } catch (error) {
      this.logger.error(
        `Failed to update patient info with Id ${Patient_id}, error.stack`,
      );
      throw new BadRequestException('Failed to update patient info.');
    }
  }

  async delete(Patient_id: number): Promise<{ message: string }> {
    try {
      const patient = await this.findOne(Patient_id);
      await this.patientRepository.remove(patient);
      this.logger.log(`Patient deleted with ID: ${Patient_id}`);
      return { message: 'Patient deleted successfully.' };
    } catch (error) {
      this.logger.error(
        `Failed to delete patient with ID: ${Patient_id}`,
        error.stack,
      );
      throw new BadRequestException('Failed to delete patient.');
    }
  }

  async findByUserId(User_id: number): Promise<Patient> {
    try {
      this.logger.log(`Looking for patient with User_id: ${User_id}`);

      // First check if patient profile exists
      let patient = await this.patientRepository.findOne({
        where: { User_id },
        relations: ['user'],
      });

      if (!patient) {
        this.logger.warn(
          `Patient with User_id ${User_id} not found. Attempting to create default profile...`,
        );

        // Try to automatically create a patient profile
        const createdPatient =
          await this.patientProfileService.ensurePatientProfile(User_id);

        if (createdPatient) {
          this.logger.log(
            `✅ Successfully created patient profile for User_id ${User_id}`,
          );
          return createdPatient;
        } else {
          // If automatic creation failed, throw the original error
          const allPatients = await this.patientRepository.find();
          this.logger.log(`Total patients in database: ${allPatients.length}`);
          this.logger.log(
            `Available User_ids: ${allPatients.map((p) => p.User_id).join(', ')}`,
          );
          throw new NotFoundException({
            message:
              'Patient profile not found for this user. Please complete your patient registration first.',
            code: 'PATIENT_NOT_FOUND',
            userId: User_id,
          });
        }
      }

      this.logger.log(
        `Found patient with Patient_id: ${patient.Patient_id} for User_id: ${User_id}`,
      );
      return patient;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException as is
      }
      this.logger.error(
        `Failed to find patient with User_id ${User_id}`,
        error.stack,
      );
      throw new BadRequestException({
        message: 'Failed to find Patient for this user.',
        error: error.message,
        userId: User_id,
      });
    }
  }
}
