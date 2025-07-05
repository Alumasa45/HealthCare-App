import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('prescription-items')
export class PrescriptionItem {
    @ApiProperty({ description: 'Unique Id for each item.'})
    @PrimaryGeneratedColumn({ type: 'int'})
    Item_id: number;

    @ApiProperty({ description: 'Prescription Id foreign key.'})
    @Column({ type: 'int', nullable: false})
    Prescription_id: number; 

    @ApiProperty({ description: 'Medicine Id foreign key.'})
    @Column({ type: 'int', nullable: false})
    Medicine_id: number; 

    @ApiProperty({ description: 'Quantity prescribed.'})
    @Column({ type: 'int', nullable: false})
    Quantity_Prescribed: number; 

    @ApiProperty({ description: 'Dosage instructions.'})
    @Column({ type: 'text', nullable: false})
    Dosage_Instructions: string; 

    @ApiProperty({ description: 'Frequency of dosage.'})
    @Column({ type: 'varchar', nullable: false})
    Frequency: string; 

    @ApiProperty({ description: 'Duration which the pills should be taken.'})
    @Column({ type: 'varchar', nullable: false})
    Duration: string; 

    @ApiProperty({ description: 'Quantity given.'})
    @Column({ type: 'int', nullable: false})
    Quantity_Dispensed: number; 

    @ApiProperty({ description: 'Unit price for each of the prescribed medicine.'})
    @Column({ type: 'decimal', nullable: false})
    Unit_Price: number; 

    @ApiProperty({ description: 'Total price for the prescribed items.'})
    @Column({ type: 'decimal', nullable: false})
    Total_Price: number; 

    @ApiProperty({ description: 'Whether substitution for the prescribed medicine id allowed.'})
    @Column({ type: 'boolean', nullable: false})
    Substitution_Allowed: boolean; 

    @ApiProperty({ description: 'Day the prescribed item was added to the system.'})
    @CreateDateColumn({ type: 'date', name: 'Created_at'})
    Created_at: Date; 
}
