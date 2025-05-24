import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { PermissionsDecorator } from './decorators/permissions.decorator';
import { PermissionsGuard } from './guards/permissions.guard';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsEnum } from './enums/PermissionsEnum';
import { PermissionQueryParamsDto } from './dto/permission-query-param.dto';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @PermissionsDecorator(PermissionsEnum.PERMISSIONS_CREATE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @PermissionsDecorator(PermissionsEnum.PERMISSIONS_READ)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get()
  findAll(@Query() queryParams: PermissionQueryParamsDto) {
    return this.permissionsService.findByQuery(queryParams);
  }

  @PermissionsDecorator(PermissionsEnum.PERMISSIONS_READ)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.findOne(id);
  }

  @PermissionsDecorator(PermissionsEnum.PERMISSIONS_UPDATE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @PermissionsDecorator(PermissionsEnum.PERMISSIONS_DELETE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.remove(id);
  }
}
