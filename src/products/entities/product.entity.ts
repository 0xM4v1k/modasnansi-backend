import { Brand } from '@brands/entities/brand.entity';
import { Category } from '@categories/entities/category.entity';
import { EducationLevel } from '@education-levels/entities/education-level.entity';
import { Size } from '@sizes/entities/size.entity';
import { TargetAudience } from '@target-audiences/entities/target-audience.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductGroup } from './product-group.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  code: string;

  @Column({
    unique: true,
  })
  name: string;

  @Column({
    nullable: true,
  })
  description: string;

  @Column()
  stock: number;

  @Column()
  genre: string;

  @Column({
    default: 'https://placehold.co/300x300/png',
  })
  image: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price: number;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @ManyToOne(() => TargetAudience)
  @JoinColumn({ name: 'target_audience_id' })
  target_audience: TargetAudience;

  @ManyToOne(() => EducationLevel)
  @JoinColumn({ name: 'education_level_id' })
  education_level: EducationLevel;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Size)
  @JoinColumn({ name: 'size_id' })
  size: Size;

  @ManyToOne(() => ProductGroup, (group) => group.variations)
  @JoinColumn({ name: 'product_group_id' })
  product_group: ProductGroup | null;

  @CreateDateColumn()
  date_created: Date;

  @UpdateDateColumn()
  date_updated: Date;
}
