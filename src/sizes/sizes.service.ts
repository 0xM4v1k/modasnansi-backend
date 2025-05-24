import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Like, Repository } from 'typeorm';
import { Size } from './entities/size.entity';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';
import { PaginationDTO } from '@common/dto/pagination.dto';
import { FindAllResultDto } from '@common/dto/find-all-result.dto';
import { SizeQueryParamsDto } from './dto/size-query-params.dto';

@Injectable()
export class SizesService {
  constructor(
    @InjectRepository(Size)
    private sizeRepository: Repository<Size>,
  ) {}

  /**
   * Método auxiliar para obtener un tamaño o lanzar NotFoundException si no existe.
   */
  private async getSizeOrThrow(condition: Partial<Size>): Promise<Size> {
    const size = await this.sizeRepository.findOne({ where: condition });
    if (!size) {
      throw new NotFoundException('Size not found');
    }
    return size;
  }

  async create(createSizeDto: CreateSizeDto): Promise<Size> {
    // Verificar duplicados por nombre (normalizado a mayúsculas)
    const normalizedName = createSizeDto.name.toUpperCase();
    const existingSize = await this.sizeRepository.findOne({
      where: { name: normalizedName },
    });

    if (existingSize) {
      throw new ConflictException('Size already exists');
    }

    const newSize = this.sizeRepository.create({
      ...createSizeDto,
      name: normalizedName,
    });

    return await this.sizeRepository.save(newSize);
  }

  async find(offset: number, limit: number): Promise<Size[]> {
    return await this.sizeRepository.find({
      skip: offset,
      take: limit,
      order: { name: 'ASC' },
    });
  }

  async findByQuery(
    queryParams: SizeQueryParamsDto,
  ): Promise<FindAllResultDto<Size>> {
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 10;
    const skip = (page - 1) * limit;
    const take = limit;

    const whereOptions: FindOptionsWhere<Size> = {};

    if (queryParams.name) {
      whereOptions.name = Like(`%${queryParams.name}%`);
    }

    const sortOrder = queryParams.sortOrder || 'DESC';
    const sortBy = queryParams.sortBy || 'date_updated';

    const findOptions: FindManyOptions<Size> = {
      skip,
      take,
      where: whereOptions,
      order: {
        [sortBy]: sortOrder,
      },
    };

    const [sizes, totalItems] =
      await this.sizeRepository.findAndCount(findOptions);

    const pagination: PaginationDTO = {
      total_items: totalItems,
      total_pages: Math.ceil(totalItems / limit),
      current_page: page,
      items_per_page: limit,
    };

    return { data: sizes, pagination };
  }

  async findOne(id: number): Promise<Size> {
    return await this.getSizeOrThrow({ id });
  }

  async update(id: number, updateSizeDto: UpdateSizeDto): Promise<Size> {
    // Verificar que el tamaño exista
    await this.getSizeOrThrow({ id });
    await this.sizeRepository.update(id, updateSizeDto);
    return await this.getSizeOrThrow({ id });
  }

  async remove(id: number): Promise<void> {
    await this.getSizeOrThrow({ id });
    try {
      await this.sizeRepository.delete({ id });
    } catch {
      throw new NotFoundException('Size not found');
    }
  }
}
