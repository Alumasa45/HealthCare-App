import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Blog {
    @ApiProperty({description: 'Unique Blog Identification number.'})
        @PrimaryGeneratedColumn({ type: 'int'})
        Blog_id: number;
    
        @ApiProperty({description: 'Blog title.'})
        @Column({ type: 'varchar', nullable: false})
        Title: string;
    
        @ApiProperty({description: 'Blog content.'})
        @Column({ type: 'varchar', nullable: false})
        Content: string;
    
        @ApiProperty({description: 'Image link.'})
        @Column({ type: 'varchar', nullable: true})
        Image_url: string;
    
        @ApiProperty({description: 'Author of the blog.'})
        @Column({ type: 'varchar', nullable: false})
        Author: string;
    
        @ApiProperty({description: 'Date the user was created.'})
        @CreateDateColumn({ type: 'timestamp', name: 'created_at'})
        Created_at?: Date;
}
