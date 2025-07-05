import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateAppointmentSlotDto } from './dto/create-appointment_slot.dto';
import { UpdateAppointmentSlotDto } from './dto/update-appointment_slot.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AppointmentSlot } from './entities/appointment_slot.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AppointmentSlotsService {
  private readonly logger = new Logger(AppointmentSlotsService.name)
    
      constructor(
        @InjectRepository(AppointmentSlot)
        private readonly appointmentSlotRepository: Repository<AppointmentSlot>,
      ) {}
    
      async create(createAppointmentSlotDto: CreateAppointmentSlotDto): Promise<AppointmentSlot> {
        try {
          const slot = this.appointmentSlotRepository.create({
            ...createAppointmentSlotDto,
            Created_at: createAppointmentSlotDto.Created_at || new Date(),
            Updated_at: createAppointmentSlotDto.Updated_at || new Date(),
          });
          const savedAppointment = await this.appointmentSlotRepository.save(slot);
          return savedAppointment;
        } catch (error) {
          this.logger.error('Failed to create appointment', error.stack);
          throw new BadRequestException({message: 'Failed to create appointment.', error: error.message});
        }
      }
    
    async findAll(): Promise<AppointmentSlot[]> {
    try {
      const slots = await this.appointmentSlotRepository.find();
      this.logger.log(`Retrieved ${slots.length} appointment slots successfully.`);
      return slots;
    } catch (error) {
      this.logger.error('Failed to retrieve appointment slots', error.stack);
      throw new BadRequestException('Failed to retrieve appointment slots.')
     }
    }
    
    async findOne(Slot_id: number): Promise<AppointmentSlot> {
      try {
        const slot = await this.appointmentSlotRepository.findOne({ where: {Slot_id} });
        if(!slot) {
          this.logger.warn(`Appointment with Id ${Slot_id} not found.`);
          throw new NotFoundException('⚠ Appointment not found!')
        }
        return slot;
      } catch (error) {
        this.logger.error(`Failed to find appointment with Id ${Slot_id}`);
        throw new BadRequestException('Failed to find appointment.')
      }
      }
    
    async update(Slot_id: number, updateappointmentSlotDto: UpdateAppointmentSlotDto): Promise <AppointmentSlot> {
      try {
        const slot = await this.findOne(Slot_id);
        Object.assign(slot, updateappointmentSlotDto);
        const updatedSlot = await this.appointmentSlotRepository.save(slot);
        this.logger.log(`Slot with Id ${Slot_id} updated successfully!`);
        return updatedSlot;
      } catch (error) {
        this.logger.error(`Failed to update appointment slot info with Id ${Slot_id}`, error.stack);
        throw new BadRequestException('Failed to update doctor info.')
      }
      }
    
    async delete(Slot_id: number): Promise<{ message: string }> {
        try {
          const slot = await this.findOne(Slot_id);
          await this.appointmentSlotRepository.remove(slot);
          this.logger.log(`Appointment slot deleted with ID: ${Slot_id}`);
          return { message: 'Appointment slot deleted successfully.' };
        } catch (error) {
          this.logger.error(`Failed to delete appointment slot with ID: ${Slot_id}`, error.stack);
          throw new BadRequestException('Failed to remove appointment slot.');
        }
    
      }
}
