import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity('pharmacy_inventory')
export class PharmacyInventory {
    @ApiProperty({ description: 'Unique identification for each inventory.'})
    @PrimaryGeneratedColumn({ type: 'int'})
    Inventory_id: number;

    @ApiProperty({ description: 'Pharmacy Id foreign key.'})
    @Column({ type: 'int', nullable: false})
    Pharmacy_id: number;

    @ApiProperty({ description: 'Medicine Id foreign key.'})
    @Column({ type: 'int', nullable: false})
    Medicine_id: number;

    @ApiProperty({ description: 'Batch number for the items.'})
    @Column({ type: 'varchar', nullable: false})
    Batch_Number: string;

    @ApiProperty({ description: 'Expiry date for the medicines.'})
    @Column({ type: 'date', nullable: false})
    Expiry_Date: Date;

    @ApiProperty({ description: 'Total stock quantity.'})
    @Column({ type: 'int', nullable: false})
    Stock_Quantity: number;

    @ApiProperty({ description: 'Unit price for each items.'})
    @Column({ type: 'decimal', nullable: false})
    Unit_Price: number;

    @ApiProperty({ description: 'Wholesale price for items.'})
    @Column({ type: 'decimal', nullable: false})
    Wholesale_Price: number;

    @ApiProperty({ description: 'Supplier name.'})
    @Column({ type: 'varchar', nullable: false})
    Supplier_Name: string;

    @ApiProperty({ description: 'Date the items were last restocked.'})
    @Column({ type: 'date', nullable: false})
    Last_Restocked: Date;

    @ApiProperty({ description: 'Date the inventory was created.'})
    @CreateDateColumn({ type: 'date', name: 'Created_at'})
    Created_at: Date;

    @ApiProperty({ description: 'Date the inventory was created.'})
    @CreateDateColumn({ type: 'date', name: 'Updated_at'})
    Updated_at: Date;
}
