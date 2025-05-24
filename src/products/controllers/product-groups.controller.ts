import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductGroupsService } from '../services/product-groups.service';
import { CreateProductGroupDto } from '../dto/create-product-group.dto';
import { UpdateProductGroupDto } from '../dto/update-product-group.dto';
import { PermissionsDecorator } from '@permissions/decorators/permissions.decorator';
import { PermissionsEnum } from '@permissions/enums/PermissionsEnum';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@permissions/guards/permissions.guard';
import { ProductGroupQueryParamsDto } from '../dto/product-group-query-params.dto';

@Controller('product-groups')
export class ProductGroupsController {
  constructor(private readonly productGroupsService: ProductGroupsService) {}

  @Get()
  findAll(@Query() queryParams: ProductGroupQueryParamsDto) {
    return this.productGroupsService.findByQuery(queryParams);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productGroupsService.findOne(id);
  }

  @PermissionsDecorator(PermissionsEnum.PRODUCT_GROUPS_CREATE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Post()
  create(
    @Body()
    createProductGroupDto: CreateProductGroupDto,
  ) {
    return this.productGroupsService.create(createProductGroupDto);
  }

  @PermissionsDecorator(PermissionsEnum.PRODUCT_GROUPS_UPDATE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateProductGroupDto: UpdateProductGroupDto,
  ) {
    return this.productGroupsService.update(id, updateProductGroupDto);
  }

  @PermissionsDecorator(PermissionsEnum.PRODUCT_GROUPS_DELETE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productGroupsService.remove(id);
  }
}
