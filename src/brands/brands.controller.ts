import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { PermissionsDecorator } from '@permissions/decorators/permissions.decorator';
import { PermissionsEnum } from '@permissions/enums/PermissionsEnum';
import { PermissionsGuard } from '@permissions/guards/permissions.guard';
import { BrandQueryParamsDto } from './dto/brand-query-param.dto';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @PermissionsDecorator(PermissionsEnum.BRANDS_CREATE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Post()
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }

  @Get()
  findAll(@Query() queryParams: BrandQueryParamsDto) {
    return this.brandsService.findByQuery(queryParams);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.brandsService.findOne(id);
  }

  @PermissionsDecorator(PermissionsEnum.BRANDS_UPDATE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return this.brandsService.update(id, updateBrandDto);
  }

  @PermissionsDecorator(PermissionsEnum.BRANDS_DELETE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.brandsService.remove(id);
  }
}
