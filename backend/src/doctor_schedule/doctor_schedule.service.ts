import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateDoctorScheduleDto } from './dto/create-doctor_schedule.dto';
import { UpdateDoctorScheduleDto } from './dto/update-doctor_schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DoctorSchedule,
  Day_Of_The_Week,
} from './entities/doctor_schedule.entity';
import { AppointmentSlot } from '../appointment_slots/entities/appointment_slot.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { addDays, format, parse, isValid } from 'date-fns';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class DoctorScheduleService {
  private readonly logger = new Logger(DoctorScheduleService.name);

  constructor(
    @InjectRepository(DoctorSchedule)
    private readonly doctorScheduleRepository: Repository<DoctorSchedule>,
    @InjectRepository(AppointmentSlot)
    private readonly appointmentSlotRepository: Repository<AppointmentSlot>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  async create(
    createDoctorScheduleDto: CreateDoctorScheduleDto,
  ): Promise<DoctorSchedule> {
    try {
      const doctor = await this.doctorRepository.findOne({
        where: { Doctor_id: createDoctorScheduleDto.Doctor_id },
      });

      if (!doctor) {
        throw new NotFoundException(
          `Doctor with ID ${createDoctorScheduleDto.Doctor_id} not found`,
        );
      }

      // Check if a schedule already exists for this doctor and day
      const existingSchedule = await this.doctorScheduleRepository.findOne({
        where: {
          Doctor_id: createDoctorScheduleDto.Doctor_id,
          Day_Of_The_Week: createDoctorScheduleDto.Day_Of_The_Week,
        },
      });

      if (existingSchedule) {
        throw new BadRequestException(
          `Schedule already exists for ${createDoctorScheduleDto.Day_Of_The_Week}`,
        );
      }

      const schedule = this.doctorScheduleRepository.create({
        ...createDoctorScheduleDto,
        Created_at: createDoctorScheduleDto.Created_at || new Date(),
        Updated_at: createDoctorScheduleDto.Updated_at || new Date(),
      });
      const savedSchedule = await this.doctorScheduleRepository.save(schedule);

      this.logger.log(
        `Doctor schedule created successfully for Doctor ID ${createDoctorScheduleDto.Doctor_id}`,
      );
      return savedSchedule;
    } catch (error) {
      this.logger.error('Failed to create schedule', error.stack);
      throw new BadRequestException({
        message: 'Failed to create schedule.',
        error: error.message,
      });
    }
  }

  async findAll(): Promise<DoctorSchedule[]> {
    try {
      const schedules = await this.doctorScheduleRepository.find();
      this.logger.log(
        `Retrieved ${schedules.length} doctor schedule successfully.`,
      );
      return schedules;
    } catch (error) {
      this.logger.error('Failed to retrieve schedule', error.stack);
      throw new BadRequestException('Failed to retrieve doctor schedule.');
    }
  }

  async findOne(Schedule_id: number): Promise<DoctorSchedule> {
    try {
      const schedule = await this.doctorScheduleRepository.findOne({
        where: { Schedule_id },
      });
      if (!schedule) {
        this.logger.warn(`Schedule with Id ${Schedule_id}`);
        throw new NotFoundException('⚠ Schedule not found!');
      }
      return schedule;
    } catch (error) {
      this.logger.error(`Failed to find schedule with Id ${Schedule_id}`);
      throw new BadRequestException('Failed to find Doctor schedule.');
    }
  }

  // findByDoctorId moved to a single implementation below

  async update(
    Schedule_id: number,
    updateDoctorScheduleDto: UpdateDoctorScheduleDto,
  ): Promise<DoctorSchedule> {
    try {
      const schedule = await this.findOne(Schedule_id);
      Object.assign(schedule, updateDoctorScheduleDto);
      const updatedSchedule =
        await this.doctorScheduleRepository.save(schedule);
      this.logger.log(
        `Doctor schedule with Id ${Schedule_id} updated successfully!`,
      );
      return updatedSchedule;
    } catch (error) {
      this.logger.error(
        `Failed to update doctor schedule info with Id ${Schedule_id}`,
        error.stack,
      );
      throw new BadRequestException('Failed to update doctor schedule.');
    }
  }

  async delete(Schedule_id: number): Promise<{ message: string }> {
    try {
      const schedule = await this.findOne(Schedule_id);
      await this.doctorScheduleRepository.remove(schedule);
      this.logger.log(`Doctor schedule deleted with ID: ${Schedule_id}`);
      return { message: 'Doctor schedule deleted successfully.' };
    } catch (error) {
      this.logger.error(
        `Failed to delete doctor schedule with ID: ${Schedule_id}`,
        error.stack,
      );
      throw new BadRequestException('Failed to remove doctor schedule.');
    }
  }

  // generateAppointmentSlots moved to a single implementation below

  async findByDoctorId(Doctor_id: number): Promise<DoctorSchedule[]> {
    try {
      const schedules = await this.doctorScheduleRepository.find({
        where: { Doctor_id: Doctor_id },
        order: { Day_Of_The_Week: 'ASC', Start_Time: 'ASC' },
      });
      this.logger.log(
        `Retrieved ${schedules.length} schedules for doctor ID ${Doctor_id}`,
      );
      return schedules;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve schedules for doctor ID ${Doctor_id}`,
        error.stack,
      );
      throw new BadRequestException('Failed to retrieve doctor schedules');
    }
  }

  async generateAppointmentSlots(
    Doctor_id: number,
    startDateStr: string,
    endDateStr: string,
  ): Promise<{ message: string; slotsGenerated: number }> {
    try {
      const doctorExists = await this.doctorScheduleRepository.manager.findOne(
        Doctor,
        {
          where: { Doctor_id: Doctor_id },
        },
      );

      if (!doctorExists) {
        throw new NotFoundException(`Doctor with ID ${Doctor_id} not found`);
      }

      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      if (!isValid(startDate) || !isValid(endDate)) {
        throw new BadRequestException('Invalid date format');
      }

      if (startDate > endDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      const schedules = await this.findByDoctorId(Doctor_id);
      if (schedules.length === 0) {
        throw new BadRequestException('No schedules found for this doctor');
      }

      this.logger.log(
        `Found ${schedules.length} schedules for doctor ${Doctor_id}`,
      );
      schedules.forEach((schedule) => {
        this.logger.log(
          `Schedule: ${schedule.Day_Of_The_Week}, ${schedule.Start_Time} - ${schedule.End_Time}, Active: ${schedule.Is_Active}`,
        );
      });

      const dayMap = {
        [Day_Of_The_Week.Sunday]: 0,
        [Day_Of_The_Week.Monday]: 1,
        [Day_Of_The_Week.Tuesday]: 2,
        [Day_Of_The_Week.Wednesday]: 3,
        [Day_Of_The_Week.Thursday]: 4,
        [Day_Of_The_Week.Friday]: 5,
        [Day_Of_The_Week.Saturday]: 6,
      };

      let currentDate = new Date(startDate);
      const slots: AppointmentSlot[] = [];
      let slotsCount = 0;
      while (currentDate <= endDate) {
        const currentDayOfWeek = currentDate.getDay();
        const matchingSchedules = schedules.filter((schedule) => {
          return dayMap[schedule.Day_Of_The_Week] === currentDayOfWeek;
        });
        for (const schedule of matchingSchedules) {
          if (!schedule.Is_Active) continue;

          // Parse time strings (format: "HH:MM:SS" or "HH:MM")
          const startTimeStr = schedule.Start_Time.toString();
          const endTimeStr = schedule.End_Time.toString();

          // Create Date objects for today with the specified times
          const [startHours, startMinutes] = startTimeStr
            .split(':')
            .map(Number);
          const [endHours, endMinutes] = endTimeStr.split(':').map(Number);

          const startTime = new Date(currentDate);
          startTime.setHours(startHours, startMinutes, 0, 0);

          const endTime = new Date(currentDate);
          endTime.setHours(endHours, endMinutes, 0, 0);

          const slotDuration = schedule.Slot_Duration; // in minutes.

          let currentSlotTime = new Date(startTime);

          while (currentSlotTime < endTime) {
            const hours = currentSlotTime
              .getHours()
              .toString()
              .padStart(2, '0');
            const minutes = currentSlotTime
              .getMinutes()
              .toString()
              .padStart(2, '0');
            const timeString = `${hours}:${minutes}:00`;

            const slot = this.appointmentSlotRepository.create({
              Doctor_id: Doctor_id,
              Appointment_id: 0,
              Slot_Date: format(currentDate, 'yyyy-MM-dd'),
              Slot_Time: timeString,
              Is_Available: true,
              Is_Blocked: false,
              Created_at: new Date(),
              Updated_at: new Date(),
            });

            slots.push(slot);
            slotsCount++;
            currentSlotTime = new Date(
              currentSlotTime.getTime() + slotDuration * 60000,
            );
          }
        }

        currentDate = addDays(currentDate, 1);
      }

      if (slots.length > 0) {
        this.logger.log(`Saving ${slots.length} slots to database`);
        await this.appointmentSlotRepository.save(slots);
        this.logger.log(`Successfully saved ${slots.length} slots`);
      } else {
        this.logger.warn(
          'No slots were generated - check schedule times and active status',
        );
      }

      this.logger.log(`Final result: ${slotsCount} slots generated`);
      return {
        message: 'Appointment slots generated successfully',
        slotsGenerated: slotsCount,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate appointment slots for doctor ID ${Doctor_id}`,
        error.stack,
      );
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to generate appointment slots');
    }
  }
}
