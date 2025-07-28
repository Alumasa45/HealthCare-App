import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

interface NotificationPayload {
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  appointmentId?: number;
  patientId?: number;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  },
  namespace: '/notifications',
})
@Injectable()
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets = new Map<number, Socket>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userSockets.set(parseInt(userId), client);
      this.logger.log(`User ${userId} connected to notifications`);

      // Send welcome notification
      this.sendNotificationToUser(parseInt(userId), {
        title: 'Connected',
        message: 'You are now connected to real-time notifications',
        type: 'success',
      });
    }
  }

  handleDisconnect(client: Socket) {
    // Find and remove user from connected sockets
    for (const [userId, socket] of this.userSockets.entries()) {
      if (socket === client) {
        this.userSockets.delete(userId);
        this.logger.log(`User ${userId} disconnected from notifications`);
        break;
      }
    }
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    this.userSockets.set(data.userId, client);
    this.logger.log(`User ${data.userId} subscribed to notifications`);
  }

  // Method to send notification to specific user
  sendNotificationToUser(
    userId: number,
    notification: Omit<NotificationPayload, 'userId'>,
  ) {
    const socket = this.userSockets.get(userId);
    if (socket) {
      socket.emit('notification', {
        ...notification,
        userId,
        timestamp: new Date(),
      });
      this.logger.log(
        `Notification sent to user ${userId}: ${notification.title}`,
      );
    } else {
      this.logger.warn(`User ${userId} not connected to receive notification`);
    }
  }

  // Method to send notification to all connected users
  broadcastNotification(notification: Omit<NotificationPayload, 'userId'>) {
    this.server.emit('notification', {
      ...notification,
      timestamp: new Date(),
    });
    this.logger.log(`Broadcast notification: ${notification.title}`);
  }

  // Method to send notification to users by role/type
  sendNotificationToUserType(
    userType: string,
    notification: Omit<NotificationPayload, 'userId'>,
  ) {
    // This would require user type tracking, implement based on your needs
    this.logger.log(
      `Notification sent to ${userType} users: ${notification.title}`,
    );
  }

  // Example method to trigger appointment reminders
  sendAppointmentReminder(userId: number, appointmentDetails: any) {
    this.sendNotificationToUser(userId, {
      title: 'Appointment Reminder',
      message: `You have an appointment in 30 minutes with ${appointmentDetails.patientName || 'a patient'}`,
      type: 'warning',
      appointmentId: appointmentDetails.appointmentId,
    });
  }

  // Example method to notify about new appointments
  sendNewAppointmentNotification(doctorId: number, appointmentDetails: any) {
    this.sendNotificationToUser(doctorId, {
      title: 'New Appointment',
      message: `New appointment booked by ${appointmentDetails.patientName} for ${appointmentDetails.date} at ${appointmentDetails.time}`,
      type: 'info',
      appointmentId: appointmentDetails.appointmentId,
      patientId: appointmentDetails.patientId,
    });
  }

  // Example method to notify about lab results
  sendLabResultsNotification(
    doctorId: number,
    patientName: string,
    patientId: number,
  ) {
    this.sendNotificationToUser(doctorId, {
      title: 'Lab Results Available',
      message: `Lab results for ${patientName} are now available for review`,
      type: 'success',
      patientId,
    });
  }
}
