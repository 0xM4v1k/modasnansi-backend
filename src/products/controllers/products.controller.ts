import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductQueryParamsDto } from '../dto/product-query-params.dto';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { FindAllResultDto } from '@common/dto/find-all-result.dto';
import { Product } from '../entities/product.entity';
import { PermissionsDecorator } from '@permissions/decorators/permissions.decorator';
import { PermissionsEnum } from '@permissions/enums/PermissionsEnum';
import { PermissionsGuard } from '@permissions/guards/permissions.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @PermissionsDecorator(PermissionsEnum.PRODUCTS_CREATE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(
    @Query() queryParams: ProductQueryParamsDto,
  ): Promise<FindAllResultDto<Product>> {
    return this.productsService.findByQuery(queryParams);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @PermissionsDecorator(PermissionsEnum.PRODUCTS_UPDATE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @PermissionsDecorator(PermissionsEnum.PRODUCTS_DELETE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
