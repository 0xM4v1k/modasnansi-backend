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
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPermission } from './dto/update-user-role.dto';
import { PermissionsGuard } from '@permissions/guards/permissions.guard';
import { PermissionsEnum } from '@permissions/enums/PermissionsEnum';
import { PermissionsDecorator } from '@permissions/decorators/permissions.decorator';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { UserQueryParamDto } from './dto/user-query-param.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @PermissionsDecorator(PermissionsEnum.USERS_CREATE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @PermissionsDecorator(PermissionsEnum.USERS_READ)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get()
  // Obtiene la lista de usuarios con paginación, filtros y búsqueda
  findAll(@Query() queryParams: UserQueryParamDto) {
    return this.usersService.findByQuery(queryParams);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findPermissionsById(id);
  }

  @PermissionsDecorator(PermissionsEnum.USERS_UPDATE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateById(id, updateUserDto);
  }

  @PermissionsDecorator(PermissionsEnum.USERS_UPDATE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Patch(':id/roles')
  updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() UpdateUserRoleDto: UpdateUserPermission,
  ) {
    return this.usersService.updateRoleById(id, UpdateUserRoleDto);
  }

  @PermissionsDecorator(PermissionsEnum.USERS_DELETE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
