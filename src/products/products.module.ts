import { Module } from '@nestjs/common';
import { ProductsService } from './services/products.service';
import { ProductsController } from './controllers/products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { BrandsService } from 'src/brands/brands.service';
import { TargetAudiencesService } from 'src/target-audiences/target-audiences.service';
import { CategoriesService } from 'src/categories/categories.service';
import { SizesService } from 'src/sizes/sizes.service';
import { TargetAudience } from 'src/target-audiences/entities/target-audience.entity';
import { Brand } from 'src/brands/entities/brand.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Size } from 'src/sizes/entities/size.entity';
import { EducationLevel } from 'src/education-levels/entities/education-level.entity';
import { EducationLevelsService } from 'src/education-levels/education-levels.service';
import { ProductGroup } from './entities/product-group.entity';
import { ProductGroupsService } from './services/product-groups.service';
import { ProductGroupsController } from './controllers/product-groups.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductGroup,
      TargetAudience,
      Brand,
      Category,
      Size,
      EducationLevel,
    ]),
  ],
  exports: [ProductsService],
  controllers: [ProductsController, ProductGroupsController],
  providers: [
    ProductsService,
    ProductGroupsService,
    TargetAudiencesService,
    BrandsService,
    CategoriesService,
    SizesService,
    EducationLevelsService,
  ],
})
export class ProductsModule {}
