import { ApiProperty } from "@nestjs/swagger";
import { ConvoType } from "src/conversations/entities/conversation.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Conversation } from "src/conversations/entities/conversation.entity";
import { Sender } from "src/senders/entities/sender.entity";

@Entity()
export class Message {
    @PrimaryGeneratedColumn({ type: 'int'})
    Message_id: number;
        
    @ApiProperty({ description: 'Conversation foreign key.'})
    @Column({ type: 'int', nullable: false })
    Conversation_id: number;
            
    @ApiProperty({ description: 'Sender foreign key.'})
    @Column({ type: 'int', nullable: false })
    Sender_id: number;
            
    @ApiProperty({ description: 'Message content.' })
    @Column({ type: 'varchar', nullable: true })
    Content: string;
            
    @ApiProperty({ description: 'Type of message.' })
    @Column({ type: 'enum', enum: ConvoType})
    Message_Type: ConvoType;
            
    @ApiProperty({ description: 'Link to an attachment.' })
    @Column({ type: 'varchar', nullable: true })
    Attachment_Url: string;
            
    @ApiProperty({ description: 'Status of the message.' })
    @Column({ type: 'boolean', nullable: true })
    Is_read: boolean;
            
    @ApiProperty({description: 'Date the message was created.'})
    @CreateDateColumn({ type: 'timestamp', name: 'created_at'})
    Created_at?: Date;
    
    @ApiProperty({description: 'Date the message was updated.'})
    @CreateDateColumn({ type: 'timestamp', name: 'Updated_at'})
    Updated_at?: Date;

    @ManyToOne(() => Conversation)
    @JoinColumn({ name: 'Conversation_id' })
    conversation: Conversation;

    @ManyToOne(() => Sender)
    @JoinColumn({ name: 'Sender_id' })
    sender: Sender;
}
