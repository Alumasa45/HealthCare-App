import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create(
      createNotificationDto,
    );
    return await this.notificationRepository.save(notification);
  }

  async findAll(): Promise<Notification[]> {
    return await this.notificationRepository.find({
      relations: ['user'],
      order: { Created_at: 'DESC' },
    });
  }

  async findByUserId(userId: number): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { User_id: userId },
      relations: ['user'],
      order: { Created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { Notification_id: id },
      relations: ['user'],
    });
    if (!notification) {
      throw new Error(`Notification with id ${id} not found`);
    }
    return notification;
  }

  async update(
    id: number,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    await this.notificationRepository.update(id, updateNotificationDto);
    return this.findOne(id);
  }

  async markAsRead(id: number): Promise<Notification> {
    await this.notificationRepository.update(id, { Status: 'read' });
    return this.findOne(id);
  }

  async markAllAsReadForUser(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { User_id: userId, Status: 'unread' },
      { Status: 'read' },
    );
  }

  async remove(id: number): Promise<void> {
    await this.notificationRepository.delete(id);
  }

  async getUnreadCount(userId: number): Promise<number> {
    return await this.notificationRepository.count({
      where: { User_id: userId, Status: 'unread' },
    });
  }

  async createPrescriptionNotification(
    patientUserId: number,
    prescriptionId: number,
    prescriptionNumber: string,
    doctorName: string,
  ): Promise<Notification> {
    const createDto: CreateNotificationDto = {
      User_id: patientUserId,
      Type: 'prescription',
      Title: 'New Prescription Available',
      Message: `You have received a new prescription (#${prescriptionNumber}) from Dr. ${doctorName}. You can now view it in your dashboard and send it to a pharmacy.`,
      Related_id: prescriptionId,
      Status: 'unread',
    };

    return await this.create(createDto);
  }
}
