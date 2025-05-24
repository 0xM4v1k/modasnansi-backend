import { Product } from '@products/entities/product.entity';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  items: Product[];
}
