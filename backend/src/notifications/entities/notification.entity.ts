import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  Notification_id: number;

  @Column()
  User_id: number;

  @Column({
    type: 'enum',
    enum: ['prescription', 'appointment', 'billing', 'general'],
    default: 'general',
  })
  Type: 'prescription' | 'appointment' | 'billing' | 'general';

  @Column()
  Title: string;

  @Column('text')
  Message: string;

  @Column({ nullable: true })
  Related_id: number;

  @Column({
    type: 'enum',
    enum: ['unread', 'read'],
    default: 'unread',
  })
  Status: 'unread' | 'read';

  @CreateDateColumn()
  Created_at: Date;

  @UpdateDateColumn()
  Updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'User_id' })
  user: User;
}
