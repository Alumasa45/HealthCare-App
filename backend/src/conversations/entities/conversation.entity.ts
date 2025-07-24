import { ApiProperty } from "@nestjs/swagger";
import { Sender } from "src/senders/entities/sender.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum ConvoType {
    direct = 'Direct',
    group = 'Group',
    consultation = 'Consultation'
}

@Entity()
export class Conversation {
      @PrimaryGeneratedColumn({ type: 'int'})
      Conversation_id: number;

      @ApiProperty({ description: 'Message title.' })
      @Column({ type: 'varchar', nullable: true })
      Title: string;
    
      @ApiProperty({ description: 'Message type.' })
      @Column({ type: 'enum', enum: ConvoType, default: ConvoType.direct })
      Type: ConvoType;
    
      @ApiProperty({ description: 'Status of the user.' })
      @Column({ type: 'boolean', nullable: true })
      Is_Active: boolean;
    
      @ApiProperty({description: 'Date the message was created.'})
      @CreateDateColumn({ type: 'timestamp', name: 'created_at'})
      Created_at?: Date;

      @ManyToOne(()=> Sender, sender => sender.conversations)
      @JoinColumn({ name: 'Sender_id'})
      sender: Sender;
    
}
