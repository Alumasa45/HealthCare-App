import { ApiProperty } from "@nestjs/swagger";
import { PrimaryGeneratedColumn, Column, CreateDateColumn, Entity, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from '../../users/entities/user.entity';
import { PharmacyInventory } from '../../pharmacy_inventory/entities/pharmacy_inventory.entity';

@Entity('pharmacies')
export class Pharmacy {
    @ApiProperty({ description: 'Pharmacy unique identification number.'})
    @PrimaryGeneratedColumn({ type: 'int'})
    Pharmacy_id: number;

    @ApiProperty({ description: 'User Id foreign key.'})
    @Column({ type: 'int', nullable: false})
    User_id: number;

    @ApiProperty({ description: 'Pharmacy name.'})
    @Column({ type: 'varchar', nullable: false})
    Pharmacy_Name: string;

    @ApiProperty({ description: 'License number for the pharmacy.'})
    @Column({ type: 'varchar', nullable: false})
    License_Number: string;

    @ApiProperty({ description: 'Pharmacist phone number.'})
    @Column({ type: 'varchar', nullable: false})
    Phone_Number: string;

    @ApiProperty({ description: 'Email registered under the pharmacy.'})
    @Column({ type: 'varchar', nullable: false})
    Email: string;

    @ApiProperty({ description: 'Operating hours for the clinic.'})
    @Column({ type: 'time'})
    Opening_Time: string;

    @ApiProperty({ description: 'Operating hours for the clinic.'})
    @Column({ type: 'time'})
    Closing_Time: string;

    @ApiProperty({ description: 'Whether the Pharmacy does deliveries.'})
    @Column({ type: 'boolean'})
    Delivery_Available: boolean;

    @ApiProperty({ description: 'Whether the pharmacy is verified to operate.'})
    @Column({ type: 'boolean'})
    Is_Verified: boolean;

    @ApiProperty({ description: 'Pharmacy Rating.'})
    @Column({ type: 'decimal'})
    Rating: number;

    @ApiProperty({ description: 'Time the pharmacy was added to the system.'})
    @CreateDateColumn({ type: 'time', name: 'Created_at'})
    Created_at: Date;

    @ApiProperty({ description: 'Time the pharmacy info was updated.'})
    @CreateDateColumn({ type: 'time', name: 'Updated_at'})
    Updated_at: Date;

    // Relationships
    @OneToOne(() => User, user => user.pharmacy)
    @JoinColumn({ name: 'User_id' })
    user: User;

    @OneToMany(() => PharmacyInventory, inventory => inventory.pharmacy)
    inventories: PharmacyInventory[];

}
