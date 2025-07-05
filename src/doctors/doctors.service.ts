import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from 'src/patients/entities/patient.entity';
import { Repository } from 'typeorm';
import { Doctor } from './entities/doctor.entity';

@Injectable()
export class DoctorsService {
  private readonly logger = new Logger(DoctorsService.name)
  
    constructor(
      @InjectRepository(Doctor)
      private readonly doctorRepository: Repository<Doctor>,
    ) {}
  
    async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
      try {
        const doctor = this.doctorRepository.create({
          ...createDoctorDto,
          Created_at: createDoctorDto.Created_at || new Date(),
          Updated_at: createDoctorDto.Updated_at || new Date(),
        });
        const savedDoctor = await this.doctorRepository.save(doctor);
        return savedDoctor;
      } catch (error) {
        this.logger.error('Failed to create doctor', error.stack);
        throw new BadRequestException({message: 'Failed to create Doctor.', error: error.message});
      }
    }
  
  async findAll(): Promise<Doctor[]> {
  try {
    const doctors = await this.doctorRepository.find();
    this.logger.log(`Retrieved ${doctors.length} doctors successfully.`);
    return doctors;
  } catch (error) {
    this.logger.error('Failed to retrieve doctors', error.stack);
    throw new BadRequestException('Failed to retrieve doctors.')
   }
  }
  
  async findOne(Doctor_id: number): Promise<Doctor> {
    try {
      const doctor = await this.doctorRepository.findOne({ where: {Doctor_id} });
      if(!doctor) {
        this.logger.warn(`Doctor with Id ${Doctor_id}`);
        throw new NotFoundException('⚠ Doctor not found!')
      }
      return doctor;
    } catch (error) {
      this.logger.error(`Failed to find doctor with Id ${Doctor_id}`);
      throw new BadRequestException('Failed to find Doctor.')
    }
    }
  
  async update(Doctor_id: number, updateDoctorDto: UpdateDoctorDto): Promise <Doctor> {
    try {
      const doctor = await this.findOne(Doctor_id);
      Object.assign(doctor, updateDoctorDto);
      const updatedDoctor = await this.doctorRepository.save(doctor);
      this.logger.log(`Doctor with Id ${Doctor_id} updated successfully!`);
      return updatedDoctor;
    } catch (error) {
      this.logger.error(`Failed to update doctor info with Id ${Doctor_id}`, error.stack);
      throw new BadRequestException('Failed to update doctor info.')
    }
    }
  
  async delete(Doctor_id: number): Promise<{ message: string }> {
      try {
        const doctor = await this.findOne(Doctor_id);
        await this.doctorRepository.remove(doctor);
        this.logger.log(`Doctor deleted with ID: ${Doctor}`);
        return { message: 'Doctor deleted successfully.' };
      } catch (error) {
        this.logger.error(`Failed to delete doctor with ID: ${Doctor_id}`, error.stack);
        throw new BadRequestException('Failed to remove doctor.');
      }
  
    }
}
