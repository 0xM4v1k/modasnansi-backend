import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { FindManyOptions, FindOptionsWhere, Like, Repository } from 'typeorm';
import { PaginationDTO } from '@common/dto/pagination.dto';
import { SortTypesEnum } from '@common/types/SortTypesEnum';
import { BrandQueryParamsDto } from './dto/brand-query-param.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand) private brandRepository: Repository<Brand>,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    const findBrand = await this.brandRepository.findOne({
      where: { name: createBrandDto.name.toUpperCase() },
    });

    if (findBrand) {
      throw new ConflictException('Brand already exists');
    }

    const newBrand = this.brandRepository.create(createBrandDto);
    return await this.brandRepository.save(newBrand);
  }

  find(page: number, limit: number): Promise<Brand[]> {
    const offset = (page - 1) * limit;

    return this.brandRepository.find({
      skip: offset,
      take: limit,
      order: { name: 'ASC' },
    });
  }

  async findByQuery(queryParams: BrandQueryParamsDto) {
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 10;
    const skip = (page - 1) * limit;

    const whereOptions: FindOptionsWhere<Brand> = {};

    if (queryParams.name) {
      whereOptions.name = Like(`%${queryParams.name}%`);
    }

    const sortOrder = queryParams.sortOrder || 'DESC';
    const sortBy = queryParams.sortBy || 'date_updated';

    const findOptions: FindManyOptions<Brand> = {
      skip,
      take: limit,
      where: whereOptions,
      order: {
        [sortBy]: SortTypesEnum[sortOrder],
      },
    };

    const [brands, totalItems] =
      await this.brandRepository.findAndCount(findOptions);

    const pagination: PaginationDTO = {
      total_items: totalItems,
      total_pages: Math.ceil(totalItems / limit),
      current_page: page,
      items_per_page: limit,
    };

    return {
      data: brands,
      pagination,
    };
  }

  findOne(id: number): Promise<Brand> {
    return this.brandRepository.findOneOrFail({ where: { id } });
  }

  async update(id: number, updateBrandDto: UpdateBrandDto) {
    const brandToUpdate = await this.brandRepository.findOne({ where: { id } });

    if (!brandToUpdate) {
      throw new ConflictException('Brand not found');
    }

    await this.brandRepository.update(id, updateBrandDto);
    return brandToUpdate;
  }

  async remove(id: number) {
    const brandToDelete = await this.brandRepository.findOne({ where: { id } });

    if (!brandToDelete) {
      throw new NotFoundException('Brand not found');
    }

    try {
      await this.brandRepository.delete({ id });
      return;
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
