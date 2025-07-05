import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateDoctorScheduleDto } from './dto/create-doctor_schedule.dto';
import { UpdateDoctorScheduleDto } from './dto/update-doctor_schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
//import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Repository } from 'typeorm';
import { DoctorSchedule } from './entities/doctor_schedule.entity';

@Injectable()
export class DoctorScheduleService {
  private readonly logger = new Logger(DoctorScheduleService.name)
    
      constructor(
        @InjectRepository(DoctorSchedule)
        private readonly doctorScheduleRepository: Repository<DoctorSchedule>,
      ) {}

      async create(createDoctorScheduleDto: CreateDoctorScheduleDto): Promise<DoctorSchedule> {
        try {
          const schedule = this.doctorScheduleRepository.create({
            ...createDoctorScheduleDto,
            Created_at: createDoctorScheduleDto.Created_at || new Date(),
            Updated_at: createDoctorScheduleDto.Updated_at || new Date(),
          });
          const savedSchedule = await this.doctorScheduleRepository.save(schedule);
          return savedSchedule;
        } catch (error) {
          this.logger.error('Failed to create schedule', error.stack);
          throw new BadRequestException({message: 'Failed to create schedule.', error: error.message});
        }
      }
    
    async findAll(): Promise<DoctorSchedule[]> {
    try {
      const schedules = await this.doctorScheduleRepository.find();
      this.logger.log(`Retrieved ${schedules.length} doctor schedule successfully.`);
      return schedules;
    } catch (error) {
      this.logger.error('Failed to retrieve schedule', error.stack);
      throw new BadRequestException('Failed to retrieve doctor schedule.')
     }
    }
    
    async findOne(Schedule_id: number): Promise<DoctorSchedule> {
      try {
        const schedule = await this.doctorScheduleRepository.findOne({ where: {Schedule_id} });
        if(!schedule) {
          this.logger.warn(`Schedule with Id ${Schedule_id}`);
          throw new NotFoundException('⚠ Schedule not found!')
        }
        return schedule;
      } catch (error) {
        this.logger.error(`Failed to find schedule with Id ${Schedule_id}`);
        throw new BadRequestException('Failed to find Doctor schedule.')
      }
      }
    
    async update(Schedule_id: number, updateDoctorScheduleDto: UpdateDoctorScheduleDto): Promise <DoctorSchedule> {
      try {
        const schedule = await this.findOne(Schedule_id);
        Object.assign(schedule, updateDoctorScheduleDto);
        const updatedSchedule = await this.doctorScheduleRepository.save(schedule);
        this.logger.log(`Doctor schedule with Id ${Schedule_id} updated successfully!`);
        return updatedSchedule;
      } catch (error) {
        this.logger.error(`Failed to update doctor schedule info with Id ${Schedule_id}`, error.stack);
        throw new BadRequestException('Failed to update doctor schedule.')
      }
      }
    
    async delete(Schedule_id: number): Promise<{ message: string }> {
        try {
          const schedule = await this.findOne(Schedule_id);
          await this.doctorScheduleRepository.remove(schedule);
          this.logger.log(`Doctor schedule deleted with ID: ${Schedule_id}`);
          return { message: 'Doctor schedule deleted successfully.' };
        } catch (error) {
          this.logger.error(`Failed to delete doctor schedule with ID: ${Schedule_id}`, error.stack);
          throw new BadRequestException('Failed to remove doctor schedule.');
        }
    
      }
}
