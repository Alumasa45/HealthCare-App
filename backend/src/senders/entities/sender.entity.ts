import { ApiProperty } from "@nestjs/swagger";
import { Conversation } from "src/conversations/entities/conversation.entity";
import { User_Type } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/users/entities/user.entity";

@Entity()
export class Sender {
@PrimaryGeneratedColumn({ type: 'int'})
Sender_id: number;
    
@ApiProperty({ description: 'Conversation foreign key.'})
@Column({ type: 'int', nullable: true })
Conversation_id: number;
        
@ApiProperty({ description: 'User foreign key.'})
@Column({ type: 'int', nullable: true })
User_id: number;
        
@ApiProperty({ description: 'User type.' })
@Column({ type: 'enum', enum: User_Type })
User_Type: User_Type;
        
@ApiProperty({ description: 'Time user joined the chat.' })
@Column({ type: 'timestamp'})
Joined_at: Date;
        
@ApiProperty({ description: 'Time user left the chat.' })
@Column({ type: 'timestamp'})
Left_at: Date;
        
@ApiProperty({ description: 'Status of the user.' })
@Column({ type: 'boolean', nullable: true })
Is_Active: boolean;
        
@ApiProperty({description: 'Date the message was created.'})
@CreateDateColumn({ type: 'timestamp', name: 'created_at'})
Created_at?: Date;

@OneToMany(()=> Conversation, conversation => conversation.sender)
conversations: Conversation[];

@ManyToOne(() => User)
@JoinColumn({ name: 'User_id' })
user: User;
}
