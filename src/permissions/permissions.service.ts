import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Like, Repository } from 'typeorm';
import { PaginationDTO } from '@common/dto/pagination.dto';
import { FindAllResultDto } from '@common/dto/find-all-result.dto';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsEnum } from './enums/PermissionsEnum';
import { PermissionQueryParamsDto } from './dto/permission-query-param.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  private async getPermissionOrThrow(
    condition: Partial<Permission>,
  ): Promise<Permission> {
    // Se podría normalizar el nombre si está presente en la condición
    if (condition.name) {
      condition.name = condition.name.toUpperCase();
    }
    const role = await this.permissionRepository.findOne({ where: condition });
    if (!role) {
      throw new NotFoundException(
        `Permission not found with condition ${JSON.stringify(condition)}`,
      );
    }
    return role;
  }

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const normalizedName = createPermissionDto.name.toUpperCase();
    const existingPermission = await this.permissionRepository.findOne({
      where: { name: normalizedName },
    });

    if (existingPermission) {
      throw new ConflictException(
        `Permissino with name ${normalizedName} already exists`,
      );
    }

    // if permission doesnt exists in enum
    if (!PermissionsEnum[normalizedName]) {
      throw new BadRequestException(
        `Permission with name ${normalizedName} is not valid`,
      );
    }

    // Se crea y se guarda el nuevo rol, normalizando el nombre
    const newPermission = this.permissionRepository.create({
      ...createPermissionDto,
      name: normalizedName,
    });
    return await this.permissionRepository.save(newPermission);
  }

  async find(offset: number, limit: number): Promise<Permission[]> {
    return await this.permissionRepository.find({
      skip: offset,
      take: limit,
      order: { name: 'ASC' },
    });
  }

  async findByQuery(
    queryParams: PermissionQueryParamsDto,
  ): Promise<FindAllResultDto<Permission>> {
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 10;

    const skip = (page - 1) * limit;

    const whereOptions: FindOptionsWhere<Permission> = {};

    if (queryParams.name) {
      whereOptions.name = Like(`%${queryParams.name}%`);
    }

    const sortOrder = queryParams.sortOrder || 'DESC';
    const sortBy = queryParams.sortBy || 'date_updated';

    const findOptions: FindManyOptions<Permission> = {
      skip,
      take: limit,
      where: whereOptions,
      order: { [sortBy]: sortOrder },
    };

    const [roles, total_items] =
      await this.permissionRepository.findAndCount(findOptions);

    const pagination: PaginationDTO = {
      total_items,
      total_pages: Math.ceil(total_items / limit),
      current_page: page,
      items_per_page: limit,
    };

    return { data: roles, pagination };
  }

  async findOne(id: number): Promise<Permission> {
    return await this.getPermissionOrThrow({ id });
  }

  async findByName(name: string): Promise<Permission> {
    return await this.getPermissionOrThrow({ name: name.toUpperCase() });
  }

  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    await this.permissionRepository.update(id, updatePermissionDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    // Verificar existencia
    await this.getPermissionOrThrow({ id });
    try {
      await this.permissionRepository.delete({ id });
    } catch {
      throw new InternalServerErrorException(
        'Something went wrong while deleting the permission',
      );
    }
  }
}
