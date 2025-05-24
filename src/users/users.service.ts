import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import {
  Repository,
  FindManyOptions,
  FindOptionsWhere,
  In,
  Like,
  UpdateResult,
} from 'typeorm';
import { UpdateUserPermission } from './dto/update-user-role.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { PaginationDTO } from '@common/dto/pagination.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Permission } from '@permissions/entities/permission.entity';
import { UserQueryParamDto } from './dto/user-query-param.dto';

const SALT_ROUNDS: number = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Normalizar username y email (por ejemplo, a minúsculas)
    const normalizedUsername = createUserDto.username.toLowerCase();
    const normalizedEmail = createUserDto.email.toLowerCase();

    const userByUsername = await this.userRepository.findOne({
      where: { username: normalizedUsername },
    });

    if (userByUsername) {
      throw new ConflictException(
        `User with username ${normalizedUsername} already exists`,
      );
    }

    const userByEmail = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (userByEmail) {
      throw new ConflictException(
        `User with email ${normalizedEmail} already exists`,
      );
    }

    // No modificar directamente el DTO; asignar el hash a una variable
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      SALT_ROUNDS,
    );

    // Crear el nuevo usuario extendiendo el DTO con los campos normalizados y la contraseña cifrada
    const newUser = this.userRepository.create({
      ...createUserDto,
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      is_active: false,
    });

    return await this.userRepository.save(newUser);
  }

  async find(page: number, limit: number): Promise<User[]> {
    return await this.userRepository.find({
      skip: (page - 1) * limit,
      take: limit,
      order: { username: 'ASC' },
      relations: {
        permissions: true,
      },
    });
  }

  async findByQuery(query: UserQueryParamDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const skip = (page - 1) * limit;
    const take = limit;

    const whereOptions: FindOptionsWhere<User> = {};

    if (query.username) {
      whereOptions.username = Like(`%${query.username}%`);
    }

    if (query.full_name) {
      whereOptions.full_name = Like(`%${query.full_name}%`);
    }

    if (query.email) {
      whereOptions.email = Like(`%${query.email}%`);
    }

    if (query.phone_number) {
      whereOptions.phone_number = Like(`%${query.phone_number}%`);
    }

    if (query.is_active !== undefined) {
      whereOptions.is_active = query.is_active;
    }

    const sortOrder = query.sortOrder || 'DESC';
    const sortBy = query.sortBy || 'date_updated';

    const findOptions: FindManyOptions<User> = {
      skip,
      take,
      where: whereOptions,
      order: {
        [sortBy]: sortOrder,
      },
      relations: {
        permissions: true,
      },
    };

    const [users, total_items] =
      await this.userRepository.findAndCount(findOptions);
    const total_pages = Math.ceil(total_items / limit);

    const pagination: PaginationDTO = {
      total_items,
      total_pages,
      current_page: page,
      items_per_page: limit,
    };

    return {
      data: users,
      pagination,
    };
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findPermissionsById(id: number): Promise<User> {
    const findUser = await this.userRepository.findOne({
      where: { id },
      relations: {
        permissions: true,
      },
    });

    if (!findUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return findUser;
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { username: username } });
  }

  async findPermissionsByUsername(username: string): Promise<User> {
    const findUser = await this.userRepository.findOne({
      where: { username },
      relations: {
        permissions: true,
      },
    });

    if (!findUser) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    return findUser;
  }

  async updateById(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateResult> {
    return await this.userRepository.update(id, updateUserDto);
  }

  async updateRoleById(
    id: number,
    updateUserPermission: UpdateUserPermission,
  ): Promise<User> {
    // Obtenemos el usuario o lanzamos excepción si no existe
    const userFound = await this.findPermissionsById(id);

    // Buscar roles a partir de los IDs proporcionados
    const permissionsFound = await this.permissionRepository.findBy({
      id: In(updateUserPermission.permission_ids),
    });

    if (
      !permissionsFound ||
      permissionsFound.length !== updateUserPermission.permission_ids.length
    ) {
      throw new NotFoundException(
        `Role not found: expected ${updateUserPermission.permission_ids.length}, but found ${permissionsFound?.length || 0}`,
      );
    }

    userFound.permissions = permissionsFound;

    return await this.userRepository.save(userFound);
  }

  async remove(id: number) {
    const userFound = await this.userRepository.findOne({ where: { id } });

    if (!userFound) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return await this.userRepository.delete({ id: userFound.id });
  }

  async activate(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.is_active = true;

    return await this.userRepository.save(user);
  }
}
