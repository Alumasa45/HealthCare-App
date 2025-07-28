import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Patient } from '../patients/entities/patient.entity';
import { CreatePatientDto } from '../patients/dto/create-patient.dto';

@Injectable()
export class PatientProfileService {
  private readonly logger = new Logger(PatientProfileService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  /**
   * Automatically creates a patient profile for a user if they don't have one
   * and their User_Type is 'Patient'
   */
  async ensurePatientProfile(userId: number): Promise<Patient | null> {
    try {
      this.logger.log(`Ensuring patient profile exists for User ID: ${userId}`);

      // First check if user exists
      const user = await this.userRepository.findOne({
        where: { User_id: userId },
      });

      if (!user) {
        this.logger.warn(`User ID ${userId} not found`);
        return null;
      }

      // Only create patient profiles for users with User_Type = 'Patient'
      if (user.User_Type !== 'Patient') {
        this.logger.log(
          `User ID ${userId} is not a Patient (Type: ${user.User_Type}), skipping patient profile creation`,
        );
        return null;
      }

      // Check if patient profile already exists
      const existingPatient = await this.patientRepository.findOne({
        where: { User_id: userId },
      });

      if (existingPatient) {
        this.logger.log(`Patient profile already exists for User ID ${userId}`);
        return existingPatient;
      }

      // Create default patient profile with minimal required data
      const defaultPatientData: CreatePatientDto = {
        User_id: userId,
        Emergency_Contact_Name: 'Not Provided',
        Emergency_Contact_Phone: 'Not Provided',
        Emergency_Contact_Relationship: 'Not Provided',
        Blood_Group: 'O+' as any, // Default blood group
        Height: 170, // Default height in cm
        Weight: 70, // Default weight in kg
        Allergies: 'None specified',
        Chronic_Conditions: 'None specified',
        Insurance_Provider: 'Not specified',
        Insurance_Policy_Number: 'Not specified',
        Created_at: new Date(),
        Updated_at: new Date(),
      };

      const newPatient = this.patientRepository.create(defaultPatientData);
      const savedPatient = await this.patientRepository.save(newPatient);

      this.logger.log(
        `✅ Created default patient profile for User ID ${userId}, Patient ID: ${savedPatient.Patient_id}`,
      );

      return savedPatient;
    } catch (error) {
      this.logger.error(
        `Failed to ensure patient profile for User ID ${userId}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Creates patient profiles for all existing Patient-type users who don't have them
   */
  async createMissingPatientProfiles(): Promise<{
    created: number;
    skipped: number;
    errors: number;
  }> {
    this.logger.log('Starting bulk creation of missing patient profiles...');

    let created = 0;
    let skipped = 0;
    let errors = 0;

    try {
      // Get all users with User_Type = 'Patient'
      const patientUsers = await this.userRepository.find({
        where: { User_Type: 'Patient' },
      });

      this.logger.log(`Found ${patientUsers.length} users with Patient type`);

      for (const user of patientUsers) {
        try {
          const result = await this.ensurePatientProfile(user.User_id);
          if (result) {
            created++;
          } else {
            skipped++;
          }
        } catch (error) {
          this.logger.error(
            `Error creating patient profile for User ID ${user.User_id}:`,
            error,
          );
          errors++;
        }
      }

      this.logger.log(
        `Bulk patient profile creation completed: ${created} created, ${skipped} skipped, ${errors} errors`,
      );

      return { created, skipped, errors };
    } catch (error) {
      this.logger.error('Bulk patient profile creation failed:', error);
      return { created, skipped, errors: errors + 1 };
    }
  }

  /**
   * Validates if a user needs a patient profile before appointment booking
   */
  async validatePatientForAppointment(userId: number): Promise<{
    valid: boolean;
    patient?: Patient;
    message?: string;
  }> {
    try {
      const user = await this.userRepository.findOne({
        where: { User_id: userId },
      });

      if (!user) {
        return {
          valid: false,
          message: 'User not found',
        };
      }

      if (user.User_Type !== 'Patient') {
        return {
          valid: false,
          message: 'Only patients can book appointments',
        };
      }

      // Try to ensure patient profile exists
      const patient = await this.ensurePatientProfile(userId);

      if (!patient) {
        return {
          valid: false,
          message: 'Could not create or find patient profile',
        };
      }

      return {
        valid: true,
        patient,
        message: 'Patient profile ready for appointment booking',
      };
    } catch (error) {
      this.logger.error(
        `Error validating patient for appointment booking:`,
        error,
      );
      return {
        valid: false,
        message: 'Error validating patient profile',
      };
    }
  }
}
