import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateTeleMedicineSessionDto } from './dto/create-tele-medicine_session.dto';
import { UpdateTeleMedicineSessionDto } from './dto/update-tele-medicine_session.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TeleMedicineSession } from './entities/tele-medicine_session.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TeleMedicineSessionsService {
  private readonly logger = new Logger(TeleMedicineSessionsService.name)
    
      constructor(
        @InjectRepository(TeleMedicineSession)
        private readonly telemedicineSessionRepository: Repository<TeleMedicineSession>,
      ) {}
    
      async create(createTeleMedicineSessionDto: CreateTeleMedicineSessionDto): Promise<TeleMedicineSession> {
        try {
          const session = this.telemedicineSessionRepository.create({
            ...createTeleMedicineSessionDto
          });
          const savedSession = await this.telemedicineSessionRepository.save(session);
          return savedSession;
        } catch (error) {
          this.logger.error('Failed to create session', error.stack);
          throw new BadRequestException({message: 'Failed to create session.', error: error.message});
        }
      }
    
    async findAll(): Promise<TeleMedicineSession[]> {
    try {
      const sessions = await this.telemedicineSessionRepository.find();
      this.logger.log(`Retrieved ${sessions.length} session successfully.`);
      return sessions;
    } catch (error) {
      this.logger.error('Failed to retrieve sessions', error.stack);
      throw new BadRequestException('Failed to retrieve sessions.')
     }
    }
    
    async findOne(Session_id: number): Promise<TeleMedicineSession> {
      try {
        const session = await this.telemedicineSessionRepository.findOne({ where: {Session_id} });
        if(!session) {
          this.logger.warn(`Session with Id ${Session_id} not found.`);
          throw new NotFoundException('⚠ Session not found!')
        }
        return session;
      } catch (error) {
        this.logger.error(`Failed to find session with Id ${Session_id}`);
        throw new BadRequestException('Failed to find Session.')
      }
      }
    
    async update(Session_id: number, updateTeleMedicineSessionDto: UpdateTeleMedicineSessionDto): Promise <TeleMedicineSession> {
      try {
        const session = await this.findOne(Session_id);
        Object.assign(session, updateTeleMedicineSessionDto);
        const updatedSession = await this.telemedicineSessionRepository.save(session);
        this.logger.log(`Session with Id ${Session_id} updated successfully!`);
        return updatedSession;
      } catch (error) {
        this.logger.error(`Failed to update session info with Id ${Session_id}`, error.stack);
        throw new BadRequestException('Failed to update session info.')
      }
      }
    
    async delete(Session_id: number): Promise<{ message: string }> {
        try {
          const session = await this.findOne(Session_id);
          await this.telemedicineSessionRepository.remove(session);
          this.logger.log(`Session deleted with ID: ${Session_id}`);
          return { message: 'Session deleted successfully.' };
        } catch (error) {
          this.logger.error(`Failed to delete session with ID: ${Session_id}`, error.stack);
          throw new BadRequestException('Failed to remove session.');
        }
    
      }
}
