import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Category } from '@categories/entities/category.entity';
import { Brand } from '@brands/entities/brand.entity';
import { EducationLevel } from '@education-levels/entities/education-level.entity';
import { TargetAudience } from '@target-audiences/entities/target-audience.entity';

@Entity('product_groups')
export class ProductGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    default: 'https://placehold.co/300x300/png',
  })
  image: string;

  @OneToMany(() => Product, (product) => product.product_group)
  variations: Product[];

  // Category, same relation as in product with category
  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  // Brand, same relation as in product with brand
  @ManyToOne(() => Brand)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  // Target audience, same relation as in product with target audience
  @ManyToOne(() => TargetAudience)
  @JoinColumn({ name: 'target_audience_id' })
  target_audience: TargetAudience;

  // Education level, same relation as in product with education level
  @ManyToOne(() => EducationLevel)
  @JoinColumn({ name: 'education_level_id' })
  education_level: EducationLevel;

  // Recommended products, many to many relation with product
  @ManyToMany(() => Product)
  @JoinTable({
    name: 'product_group_recommendations',
    joinColumn: {
      name: 'product_group_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'recommended_product_id',
      referencedColumnName: 'id',
    },
  })
  recommended_products: Product[];

  @CreateDateColumn()
  date_created: Date;

  @UpdateDateColumn()
  date_updated: Date;
}
