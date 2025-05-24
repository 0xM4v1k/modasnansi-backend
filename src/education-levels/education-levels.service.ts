import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEducationLevelDto } from './dto/create-education-level.dto';
import { UpdateEducationLevelDto } from './dto/update-education-level.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationLevel } from './entities/education-level.entity';
import { FindManyOptions, FindOptionsWhere, Like, Repository } from 'typeorm';
import { FindAllResultDto } from '@common/dto/find-all-result.dto';
import { PaginationDTO } from '@common/dto/pagination.dto';
import { EducationLevelQueryParamsDto } from './dto/education-level-query-params.dto';

@Injectable()
export class EducationLevelsService {
  constructor(
    @InjectRepository(EducationLevel)
    private educationLevelRepository: Repository<EducationLevel>,
  ) {}

  async create(
    createEducationLevelDto: CreateEducationLevelDto,
  ): Promise<EducationLevel> {
    const findEducationLevel = await this.educationLevelRepository.findOne({
      where: { name: createEducationLevelDto.name.toUpperCase() },
    });

    if (findEducationLevel) {
      throw new ConflictException('Education Level already exists');
    }

    const newEducationLevel = this.educationLevelRepository.create(
      createEducationLevelDto,
    );
    return await this.educationLevelRepository.save(newEducationLevel);
  }

  async find(offset: number, limit: number): Promise<EducationLevel[]> {
    return await this.educationLevelRepository.find({
      skip: offset,
      take: limit,
      order: { name: 'ASC' },
    });
  }

  async findByQuery(
    queryParams: EducationLevelQueryParamsDto,
  ): Promise<FindAllResultDto<EducationLevel>> {
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 10;
    const skip = (page - 1) * limit;
    const take = limit;

    const where: FindOptionsWhere<EducationLevel> = {};

    if (queryParams.name) {
      where.name = Like(`%${queryParams.name}%`);
    }

    const sortOrder = queryParams.sortOrder || 'DESC';
    const sortBy = queryParams.sortBy || 'date_updated';

    // Construye las opciones de búsqueda
    const findOptions: FindManyOptions<EducationLevel> = {
      skip,
      take,
      where,
      order: {
        [sortBy]: sortOrder,
      },
    };

    // Realiza la consulta y cuenta el total de elementos
    const [educationLevels, total_items] =
      await this.educationLevelRepository.findAndCount(findOptions);

    // Construye el objeto de paginación
    const pagination: PaginationDTO = {
      total_items,
      total_pages: Math.ceil(total_items / limit),
      current_page: page,
      items_per_page: limit,
    };

    return {
      data: educationLevels,
      pagination,
    };
  }

  async findOne(id: number): Promise<EducationLevel> {
    const findEducationLevel = await this.educationLevelRepository.findOne({
      where: { id },
    });
    if (!findEducationLevel) {
      throw new NotFoundException('Education Level not found');
    }
    return findEducationLevel;
  }

  async update(
    id: number,
    updateEducationLevelDto: UpdateEducationLevelDto,
  ): Promise<EducationLevel | null> {
    const findEducationLevel = await this.educationLevelRepository.findOne({
      where: { id },
    });
    if (!findEducationLevel) {
      throw new NotFoundException('Education Level not found');
    }
    await this.educationLevelRepository.update(id, updateEducationLevelDto);

    const newEducationLevel = await this.educationLevelRepository.findOne({
      where: { id },
    });

    return newEducationLevel;
  }

  async remove(id: number) {
    const findEducationLevel = await this.educationLevelRepository.findOne({
      where: { id },
    });
    if (!findEducationLevel) {
      throw new NotFoundException('Education Level not found');
    }
    try {
      await this.educationLevelRepository.delete(id);
      return findEducationLevel;
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
