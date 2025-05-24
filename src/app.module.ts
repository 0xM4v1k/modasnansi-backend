import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '@products/products.module';
import { BrandsModule } from '@brands/brands.module';
import { TargetAudiencesModule } from '@target-audiences/target-audiences.module';
import { CategoriesModule } from '@categories/categories.module';
import { EducationLevelsModule } from '@education-levels/education-levels.module';
import { SizesModule } from '@sizes/sizes.module';
import { UsersModule } from '@users/users.module';
import { AuthModule } from '@auth/auth.module';
import config from './ORMconfig';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { FilesModule } from '@files/files.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from '@common/exceptions/http-exception.filter';
import { PermissionsModule } from '@permissions/permissions.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    // 30 request in 1 minute
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 100,
      },
    ]),
    TypeOrmModule.forRoot(config),
    PermissionsModule,
    UsersModule,
    AuthModule,
    FilesModule,
    BrandsModule,
    TargetAudiencesModule,
    CategoriesModule,
    EducationLevelsModule,
    SizesModule,
    ProductsModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    AppService,
  ],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);

  constructor() {
    this.logger.log(`Environment is "${process.env.ENVIRONMENT}"`);
    this.logger.log(`Node environment is "${process.env.NODE_ENV}"`);
  }
}
