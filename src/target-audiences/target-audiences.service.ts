import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTargetAudienceDto } from './dto/create-target-audience.dto';
import { UpdateTargetAudienceDto } from './dto/update-target-audience.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Like, Repository } from 'typeorm';
import { TargetAudience } from './entities/target-audience.entity';
import { FindAllResultDto } from '@common/dto/find-all-result.dto';
import { PaginationDTO } from '@common/dto/pagination.dto';
import { TargetAudienceQueryParamsDto } from './dto/target-audience-query-params.dto';

@Injectable()
export class TargetAudiencesService {
  constructor(
    @InjectRepository(TargetAudience)
    private targetAudienceRepository: Repository<TargetAudience>,
  ) {}

  private async getTargetAudienceOrThrow(
    condition: Partial<TargetAudience>,
  ): Promise<TargetAudience> {
    try {
      return await this.targetAudienceRepository.findOneOrFail({
        where: condition,
      });
    } catch {
      throw new NotFoundException(
        `Target with condition ${JSON.stringify(condition)} not found`,
      );
    }
  }

  async create(
    createTargetAudienceDto: CreateTargetAudienceDto,
  ): Promise<TargetAudience> {
    // Se normaliza el nombre a mayúsculas (si la regla es esa)
    const normalName = createTargetAudienceDto.name.toUpperCase();

    const existingAudience = await this.targetAudienceRepository.findOne({
      where: { name: normalName },
    });

    if (existingAudience) {
      throw new ConflictException(
        `Target with name ${normalName} audience already exists`,
      );
    }

    // Crear target audience con el nombre normalizado
    const newTargetAudience = this.targetAudienceRepository.create({
      ...createTargetAudienceDto,
      name: normalName,
    });

    return await this.targetAudienceRepository.save(newTargetAudience);
  }

  async find(offset: number, limit: number): Promise<TargetAudience[]> {
    return await this.targetAudienceRepository.find({
      skip: offset,
      take: limit,
      order: { name: 'ASC' },
    });
  }

  async findByQuery(
    queryParams: TargetAudienceQueryParamsDto,
  ): Promise<FindAllResultDto<TargetAudience>> {
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 10;
    const skip = (page - 1) * limit;

    const whereOptions: FindOptionsWhere<TargetAudience> = {};

    if (queryParams.name) {
      whereOptions.name = Like(`%${queryParams.name}%`);
    }

    const sortOrder = queryParams.sortOrder || 'DESC';
    const sortBy = queryParams.sortBy || 'date_updated';

    const findOptions: FindManyOptions<TargetAudience> = {
      skip,
      take: limit,
      where: whereOptions,
      order: {
        [sortBy]: sortOrder,
      },
    };

    const [targetAudiences, totalItems] =
      await this.targetAudienceRepository.findAndCount(findOptions);

    const pagination: PaginationDTO = {
      total_items: totalItems,
      total_pages: Math.ceil(totalItems / limit),
      current_page: page,
      items_per_page: limit,
    };

    return {
      data: targetAudiences,
      pagination,
    };
  }

  async findByName(name: string): Promise<TargetAudience> {
    // Si es necesario que la búsqueda sea case-insensitive, se puede normalizar
    const normalizedName = name.toUpperCase();
    return await this.getTargetAudienceOrThrow({ name: normalizedName });
  }

  async findOne(id: number): Promise<TargetAudience> {
    return await this.getTargetAudienceOrThrow({ id });
  }

  async update(
    id: number,
    updateTargetAudienceDto: UpdateTargetAudienceDto,
  ): Promise<TargetAudience> {
    // Verificamos que el target audience exista
    await this.getTargetAudienceOrThrow({ id });

    // Actualizamos y retornamos el target audience actualizado
    await this.targetAudienceRepository.update(id, updateTargetAudienceDto);
    return await this.getTargetAudienceOrThrow({ id });
  }

  async remove(id: number): Promise<void> {
    await this.getTargetAudienceOrThrow({ id });

    try {
      await this.targetAudienceRepository.delete({ id });
    } catch {
      throw new InternalServerErrorException(
        'Something wrong happened trying to delete the target audience',
      );
    }
  }
}
