import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum Address_Type {
    Home = 'Home',
    Work = 'Work',
    Other = 'Other',
}

@Entity('Addresses')
export class Address {
@PrimaryGeneratedColumn({ type: 'int'})
@ApiProperty({ description: 'Unique address identification number.'})
Address_id: number;

@ApiProperty({ description: 'User Id foreign key.'})
@Column({ type: 'int', nullable: false})
User_id: number;

@ApiProperty({ description: 'Address type.'})
@Column({ type: 'enum', enum:Address_Type})
Address_Type: Address_Type;

@ApiProperty({ description: 'Country where the address is based.'})
@Column({ type: 'varchar', nullable: false})
Country: string;

@ApiProperty({ description: 'City where the address is based.'})
@Column({ type: 'varchar', nullable: false})
City: string;

@ApiProperty({ description: 'Postal code of the address.'})
@Column({ type: 'varchar', nullable: false})
Postal_Code: string;

@ApiProperty({ description: 'Time the address was added.'})
  @Column({ 
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP' 
  })
  Created_at?: Date;
}
