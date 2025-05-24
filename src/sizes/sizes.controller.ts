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
import { SizesService } from './sizes.service';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { PermissionsDecorator } from '@permissions/decorators/permissions.decorator';
import { PermissionsEnum } from '@permissions/enums/PermissionsEnum';
import { PermissionsGuard } from '@permissions/guards/permissions.guard';
import { SizeQueryParamsDto } from './dto/size-query-params.dto';

@Controller('sizes')
export class SizesController {
  constructor(private readonly sizesService: SizesService) {}

  @PermissionsDecorator(PermissionsEnum.SIZES_CREATE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Post()
  create(@Body() createSizeDto: CreateSizeDto) {
    return this.sizesService.create(createSizeDto);
  }

  @PermissionsDecorator(PermissionsEnum.SIZES_READ)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get()
  findAll(@Query() queryParams: SizeQueryParamsDto) {
    return this.sizesService.findByQuery(queryParams);
  }

  @PermissionsDecorator(PermissionsEnum.SIZES_READ)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sizesService.findOne(id);
  }

  @PermissionsDecorator(PermissionsEnum.SIZES_UPDATE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSizeDto: UpdateSizeDto,
  ) {
    return this.sizesService.update(id, updateSizeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sizesService.remove(id);
  }
}
