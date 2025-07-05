import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name)
    
      constructor(
        @InjectRepository(Appointment)
        private readonly appointmentRepository: Repository<Appointment>,
      ) {}
    
      async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
        try {
          const appointment = this.appointmentRepository.create({
            ...createAppointmentDto,
            Created_at: createAppointmentDto.Created_at || new Date(),
            Updated_at: createAppointmentDto.Updated_at || new Date(),
          });
          const savedAppointment = await this.appointmentRepository.save(appointment);
          return savedAppointment;
        } catch (error) {
          this.logger.error('Failed to create appointment', error.stack);
          throw new BadRequestException({message: 'Failed to create appointment.', error: error.message});
        }
      }
    
    async findAll(): Promise<Appointment[]> {
    try {
      const appointments = await this.appointmentRepository.find();
      this.logger.log(`Retrieved ${appointments.length} appointments successfully.`);
      return appointments;
    } catch (error) {
      this.logger.error('Failed to retrieve appointments', error.stack);
      throw new BadRequestException('Failed to retrieve appointments.')
     }
    }
    
    async findOne(Appointment_id: number): Promise<Appointment> {
      try {
        const appointment = await this.appointmentRepository.findOne({ where: {Appointment_id} });
        if(!appointment) {
          this.logger.warn(`Appointment with Id ${Appointment_id}`);
          throw new NotFoundException('⚠ Appointment not found!')
        }
        return appointment;
      } catch (error) {
        this.logger.error(`Failed to find appointment with Id ${Appointment_id}`);
        throw new BadRequestException('Failed to find appointment.')
      }
      }
    
    async update(Appointment_id: number, updateAppointmentDto: UpdateAppointmentDto): Promise <Appointment> {
      try {
        const appointment = await this.findOne(Appointment_id);
        Object.assign(appointment, updateAppointmentDto);
        const updatedAppointment = await this.appointmentRepository.save(appointment);
        this.logger.log(`Appointment with Id ${Appointment} updated successfully!`);
        return updatedAppointment;
      } catch (error) {
        this.logger.error(`Failed to update appointment info with Id ${Appointment_id}`, error.stack);
        throw new BadRequestException('Failed to update appointment info.')
      }
      }
    
    async delete(Appointment_id: number): Promise<{ message: string }> {
        try {
          const appointment = await this.findOne(Appointment_id);
          await this.appointmentRepository.remove(appointment);
          this.logger.log(`Appointment deleted with ID: ${Appointment_id}`);
          return { message: 'Appointment deleted successfully.' };
        } catch (error) {
          this.logger.error(`Failed to delete appointment with ID: ${Appointment_id}`, error.stack);
          throw new BadRequestException('Failed to remove appointment.');
        }
    
      }
}
