import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { FindManyOptions, FindOptionsWhere, Like, Repository } from 'typeorm';
import { PaginationDTO } from '@common/dto/pagination.dto';
import { FindAllResultDto } from '@common/dto/find-all-result.dto';
import { CategoryQueryParamsDto } from './dto/category-query-params.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const findCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name.toUpperCase() },
    });

    if (findCategory) {
      throw new ConflictException('Category already exists');
    }

    const newCategory = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(newCategory);
  }

  async find(offset: number, limit: number): Promise<Category[]> {
    return await this.categoryRepository.find({
      skip: offset,
      take: limit,
      order: { name: 'ASC' },
    });
  }

  async findByQuery(
    queryParams: CategoryQueryParamsDto,
  ): Promise<FindAllResultDto<Category>> {
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 10;
    const skip = (page - 1) * limit;

    const whereOptions: FindOptionsWhere<Category> = {};

    if (queryParams.name) {
      whereOptions.name = Like(`%${queryParams.name}%`);
    }

    const sortOrder = queryParams.sortOrder || 'DESC';
    const sortBy = queryParams.sortBy || 'date_updated';

    const findOptions: FindManyOptions<Category> = {
      skip,
      take: limit,
      where: whereOptions,
      order: {
        [sortBy]: sortOrder,
      },
    };

    const [categories, total_items] =
      await this.categoryRepository.findAndCount(findOptions);

    const pagination: PaginationDTO = {
      total_items,
      total_pages: Math.ceil(total_items / limit),
      current_page: page,
      items_per_page: limit,
    };

    return { data: categories, pagination };
  }

  async findOne(id: number): Promise<Category> {
    const findCategory = await this.categoryRepository.findOne({
      where: { id },
    });
    if (!findCategory) {
      throw new NotFoundException('Category not found');
    }
    return findCategory;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category | null> {
    const findCategory = await this.categoryRepository.findOne({
      where: { id },
    });
    if (!findCategory) {
      throw new NotFoundException('Category not found');
    }
    await this.categoryRepository.update(id, updateCategoryDto);

    const newCategory = await this.categoryRepository.findOne({
      where: { id },
    });

    return newCategory;
  }

  async remove(id: number) {
    const findCategory = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!findCategory) {
      throw new NotFoundException('Category not found');
    }

    try {
      await this.categoryRepository.remove(findCategory);
      return;
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
