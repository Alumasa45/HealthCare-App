import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MedicineOrder } from './medicine_order.entity';

@Entity('medicine_order_items')
export class MedicineOrderItem {
  @ApiProperty({ description: 'Unique identification for each order item.' })
  @PrimaryGeneratedColumn({ type: 'int' })
  Order_Item_id: number;

  @ApiProperty({ description: 'Order Id foreign key.' })
  @Column({ type: 'int', nullable: false })
  Order_id: number;

  @ApiProperty({ description: 'Medicine Id foreign key.' })
  @Column({ type: 'int', nullable: false })
  Medicine_id: number;

  @ApiProperty({ description: 'Quantity ordered.' })
  @Column({ type: 'int', nullable: false })
  Quantity: number;

  @ApiProperty({ description: 'Unit price of the medicine.' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  Unit_Price: number;

  @ApiProperty({ description: 'Total price for this item.' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  Total_Price: number;

  // Relations
  @ManyToOne(() => MedicineOrder, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'Order_id' })
  order: MedicineOrder;
}
