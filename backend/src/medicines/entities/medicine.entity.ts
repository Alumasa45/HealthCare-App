import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { PrescriptionItem } from '../../prescription_items/entities/prescription_item.entity';
import { PharmacyInventory } from '../../pharmacy_inventory/entities/pharmacy_inventory.entity';


export enum Strength {
    Very_Strong = 'Very Strong',
    Average = 'Average',
}

@Entity('medicines')
export class Medicine {
@ApiProperty({ description: 'Unique identifier for the medicine.'})
@PrimaryGeneratedColumn({ type: 'int'})
Medicine_id: number;

@ApiProperty({ description: 'Name of the medicine.'})
@Column({ type: 'varchar', nullable: false})
Medicine_Name: string;

@ApiProperty({ description: 'Name of medicine brand.'})
@Column({ type: 'varchar', nullable: false})
Brand_Name: string;

@ApiProperty({ description: 'Manufacturer of medicine brand.'})
@Column({ type: 'varchar', nullable: false})
Manufacturer: string;

@ApiProperty({ description: 'Category of medicine brand.'})
@Column({ type: 'varchar', nullable: false})
Category: string;

@ApiProperty({ description: 'Dosage of medicine.'})
@Column({ type: 'varchar', nullable: false})
Dosage: string;

@ApiProperty({ description: 'Strength of medicine.'})
@Column({ type: 'enum', enum: Strength})
Strength: Strength;

@ApiProperty({ description: 'Description of medicine.'})
@Column({ type: 'text', nullable: false})
Description: string;

@ApiProperty({ description: 'Side effects of the medicine.'})
@Column({ type: 'text', nullable: false})
Side_Effects: string;

@ApiProperty({ description: 'Storage instructions for the medicine.'})
@Column({ type: 'text', nullable: false})
Storage_Instructions: string;

@ApiProperty({ description: 'Time the medicine was added.'})
@CreateDateColumn({ type: 'time', name: 'Created_at'})
Created_at: Date;

@ApiProperty({ description: 'Time the medicine was updated.'})
@CreateDateColumn({ type: 'time', name: 'Updated_at'})
Updated_at: Date;

// Relationships
@OneToMany(() => PrescriptionItem, item => item.medicine)
prescriptionItems: PrescriptionItem[];

@OneToMany(() => PharmacyInventory, inventory => inventory.medicine)
inventories: PharmacyInventory[];

}
