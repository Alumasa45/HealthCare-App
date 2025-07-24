import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Prescription } from './entities/prescription.entity';
import { Repository } from 'typeorm';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PrescriptionsService {
  private readonly logger = new Logger(PrescriptionsService.name);

  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(
    createPrescriptionDto: CreatePrescriptionDto,
  ): Promise<Prescription> {
    try {
      const prescription = this.prescriptionRepository.create({
        ...createPrescriptionDto,
        Created_at: createPrescriptionDto.Created_at || new Date(),
        Updated_at: createPrescriptionDto.Updated_at || new Date(),
      });
      const savedPrescription =
        await this.prescriptionRepository.save(prescription);

      // Get the prescription with relations to access patient and doctor info
      const prescriptionWithRelations =
        await this.prescriptionRepository.findOne({
          where: { Prescription_id: savedPrescription.Prescription_id },
          relations: ['doctor', 'doctor.user', 'patient', 'patient.user'],
        });

      // Send notification to patient
      if (
        prescriptionWithRelations?.patient?.user &&
        prescriptionWithRelations?.doctor?.user
      ) {
        try {
          await this.notificationsService.createPrescriptionNotification(
            prescriptionWithRelations.patient.User_id,
            savedPrescription.Prescription_id,
            savedPrescription.Prescription_Number,
            `${prescriptionWithRelations.doctor.user.First_Name} ${prescriptionWithRelations.doctor.user.Last_Name}`,
          );
          this.logger.log(
            `Notification sent to patient for prescription ${savedPrescription.Prescription_Number}`,
          );
        } catch (notificationError) {
          this.logger.error(
            'Failed to send notification to patient',
            notificationError.stack,
          );
          // Don't throw error here - prescription was created successfully
        }
      }

      return savedPrescription;
    } catch (error) {
      this.logger.error('Failed to add prescription', error.stack);
      throw new BadRequestException({
        message: 'Failed to add prescription.',
        error: error.message,
      });
    }
  }

  async findAll(): Promise<Prescription[]> {
    try {
      const prescriptions = await this.prescriptionRepository.find({
        relations: ['doctor', 'doctor.user', 'patient', 'patient.user'],
      });
      this.logger.log(
        `Retrieved ${prescriptions.length} prescriptions successfully.`,
      );
      return prescriptions;
    } catch (error) {
      this.logger.error('Failed to retrieve prescriptions', error.stack);
      throw new BadRequestException('Failed to retrieve prescriptions.');
    }
  }

  async findByPatientId(Patient_id: number): Promise<Prescription[]> {
    try {
      const prescriptions = await this.prescriptionRepository.find({
        where: { Patient_id },
        relations: [
          'doctor',
          'doctor.user',
          'patient',
          'patient.user',
          'appointment',
        ],
        order: { Issue_Date: 'DESC' },
      });
      this.logger.log(
        `Retrieved ${prescriptions.length} prescriptions for patient ${Patient_id}.`,
      );
      return prescriptions;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve prescriptions for patient ${Patient_id}`,
        error.stack,
      );
      throw new BadRequestException(
        'Failed to retrieve patient prescriptions.',
      );
    }
  }

  async findOne(Prescription_id: number): Promise<Prescription> {
    try {
      const prescription = await this.prescriptionRepository.findOne({
        where: { Prescription_id },
      });
      if (!prescription) {
        this.logger.warn(`Prescription with Id ${Prescription_id}`);
        throw new NotFoundException('⚠ Prescription not found!');
      }
      return prescription;
    } catch (error) {
      this.logger.error(
        `Failed to find prescription with Id ${Prescription_id}`,
      );
      throw new BadRequestException('Failed to find prescription.');
    }
  }

  async update(
    Prescription_id: number,
    updatePrescriptionDto: UpdatePrescriptionDto,
  ): Promise<Prescription> {
    try {
      const prescription = await this.findOne(Prescription_id);
      Object.assign(prescription, updatePrescriptionDto);
      const updatedPrescription =
        await this.prescriptionRepository.save(prescription);
      this.logger.log(
        `Prescription with Id ${Prescription_id} updated successfully!`,
      );
      return updatedPrescription;
    } catch (error) {
      this.logger.error(
        `Failed to update prescription info with Id ${Prescription_id}`,
        error.stack,
      );
      throw new BadRequestException('Failed to update prescription info.');
    }
  }

  async delete(Prescription_id: number): Promise<{ message: string }> {
    try {
      const prescription = await this.findOne(Prescription_id);
      await this.prescriptionRepository.remove(prescription);
      this.logger.log(`Prescription deleted with ID: ${Prescription_id}`);
      return { message: 'Prescription deleted successfully.' };
    } catch (error) {
      this.logger.error(
        `Failed to delete prescryption with ID: ${Prescription_id}`,
        error.stack,
      );
      throw new BadRequestException('Failed to remove prescription.');
    }
  }
}
