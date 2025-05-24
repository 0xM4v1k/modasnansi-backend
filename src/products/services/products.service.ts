import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import {
  FindManyOptions,
  FindOptionsWhere,
  In,
  Like,
  MoreThanOrEqual,
  QueryRunner,
  Repository,
} from 'typeorm';
import { PaginationDTO } from 'src/common/dto/pagination.dto';
import { BrandsService } from 'src/brands/brands.service';
import { TargetAudiencesService } from 'src/target-audiences/target-audiences.service';
import { CategoriesService } from 'src/categories/categories.service';
import { SizesService } from 'src/sizes/sizes.service';
import { FindAllResultDto } from 'src/common/dto/find-all-result.dto';
import { EducationLevelsService } from 'src/education-levels/education-levels.service';
import { ProductQueryParamsDto } from '../dto/product-query-params.dto';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    private readonly brandService: BrandsService,
    private readonly targetAudiecesService: TargetAudiencesService,
    private readonly categoriesService: CategoriesService,
    private readonly sizesService: SizesService,
    private readonly educationLevelsService: EducationLevelsService,
  ) {}

  private async getProductOrThrow(
    condition: FindOptionsWhere<Product>,
  ): Promise<Product> {
    try {
      return await this.productRepository.findOneOrFail({
        where: condition,
        relations: {
          brand: true,
          target_audience: true,
          category: true,
          size: true,
          education_level: true,
        },
      });
    } catch {
      const id = condition.id ? condition.id : 'desconocido';
      throw new NotFoundException(
        `Producto con ID '${JSON.stringify(id)}' no encontrado`,
      );
    }
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Crear QueryRunner
    const queryRunner =
      this.productRepository.manager.connection.createQueryRunner();

    // Conectar y comenzar transacción
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validar duplicados por nombre
      const productFound = await queryRunner.manager.findOne(Product, {
        where: { name: createProductDto.name },
      });

      if (productFound) {
        throw new ConflictException(
          `Producto con nombre '${createProductDto.name}' ya existe`,
        );
      }

      // Validar duplicados por código
      const productFoundByCode = await queryRunner.manager.findOne(Product, {
        where: { code: createProductDto.code },
      });

      if (productFoundByCode) {
        throw new ConflictException(
          `Producto con código '${createProductDto.code}' ya existe`,
        );
      }

      // Validar existencia de asociaciones
      const brandExist = await this.brandService.findOne(
        createProductDto.brand_id,
      );
      if (!brandExist) {
        throw new NotFoundException(
          `Marca con ID '${createProductDto.brand_id}' no encontrada`,
        );
      }

      const targetAudienceExist = await this.targetAudiecesService.findOne(
        createProductDto.target_audience_id,
      );
      if (!targetAudienceExist) {
        throw new NotFoundException(
          `Público objetivo con ID '${createProductDto.target_audience_id}' no encontrado`,
        );
      }

      const categoryExist = await this.categoriesService.findOne(
        createProductDto.category_id,
      );
      if (!categoryExist) {
        throw new NotFoundException(
          `Categoría con ID '${createProductDto.category_id}' no encontrada`,
        );
      }

      const sizeExist = await this.sizesService.findOne(
        createProductDto.size_id,
      );
      if (!sizeExist) {
        throw new NotFoundException(
          `Talla con ID '${createProductDto.size_id}' no encontrada`,
        );
      }

      const educationLevelExist = await this.educationLevelsService.findOne(
        createProductDto.education_level_id,
      );
      if (!educationLevelExist) {
        throw new NotFoundException(
          `Nivel de educación con ID '${createProductDto.education_level_id}' no encontrado`,
        );
      }

      // Crear y guardar producto
      const newProduct = queryRunner.manager.create(Product, {
        code: createProductDto.code,
        name: createProductDto.name,
        description: createProductDto.description,
        stock: createProductDto.stock,
        price: createProductDto.price,
        image: createProductDto.image,
        genre: createProductDto.genre,
        brand: brandExist,
        target_audience: targetAudienceExist,
        education_level: educationLevelExist,
        category: categoryExist,
        size: sizeExist,
      });

      const savedProduct = await queryRunner.manager.save(newProduct);

      // Confirmar cambios
      await queryRunner.commitTransaction();

      return savedProduct;
    } catch (error: unknown) {
      // Revertir cambios en caso de error
      await queryRunner.rollbackTransaction();

      // Manejar errores específicos
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      // Manejar errores técnicos
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';

      throw new InternalServerErrorException(
        `Error al crear producto: ${errorMessage}`,
      );
    } finally {
      // Liberar recursos
      await queryRunner.release();
    }
  }

  async find(offset: number, limit: number): Promise<Product[]> {
    return this.productRepository.find({
      skip: offset,
      take: limit,
      order: { name: 'ASC' },
    });
  }

  async findByQuery(
    queryParams: ProductQueryParamsDto,
  ): Promise<FindAllResultDto<Product>> {
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 10;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Product> = {};

    // code
    if (queryParams.code) {
      where.code = Like(`%${queryParams.code}%`);
    }

    // name
    if (queryParams.name) {
      where.name = Like(`%${queryParams.name}%`);
    }

    // description
    if (queryParams.description) {
      where.description = Like(`%${queryParams.description}%`);
    }

    // price
    if (queryParams.price) {
      where.price = queryParams.price;
    }

    // brand_name
    if (queryParams.brand_name) {
      where.brand = {
        name: Like(`%${queryParams.brand_name}%`),
      };
    }

    // target_audience_name
    if (queryParams.target_audience_name) {
      where.target_audience = {
        name: Like(`%${queryParams.target_audience_name}%`),
      };
    }

    // education_level_name
    if (queryParams.education_level_name) {
      where.education_level = {
        name: Like(`%${queryParams.education_level_name}%`),
      };
    }

    // category_name
    if (queryParams.category_name) {
      where.category = {
        name: Like(`%${queryParams.category_name}%`),
      };
    }

    // size_name
    if (queryParams.size_name) {
      where.size = {
        name: Like(`%${queryParams.size_name}%`),
      };
    }

    const sortOrder = queryParams.sortOrder || 'DESC';
    const sortBy = queryParams.sortBy || 'date_updated';

    const findOptions: FindManyOptions<Product> = {
      skip,
      take: limit,
      where,
      order: {
        [sortBy]: sortOrder,
      },
      relations: {
        category: true,
        brand: true,
        size: true,
        target_audience: true,
        education_level: true,
      },
    };

    const [products, total_items] =
      await this.productRepository.findAndCount(findOptions);

    const pagination: PaginationDTO = {
      total_items,
      total_pages: Math.ceil(total_items / limit),
      current_page: page,
      items_per_page: limit,
    };

    return {
      data: products,
      pagination,
    };
  }

  async findOne(id: number): Promise<Product> {
    return await this.getProductOrThrow({ id });
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    // Crear QueryRunner
    const queryRunner =
      this.productRepository.manager.connection.createQueryRunner();

    // Conectar y comenzar transacción
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar que el producto exista
      const existingProduct = await queryRunner.manager.findOne(Product, {
        where: { id },
        relations: {
          brand: true,
          target_audience: true,
          category: true,
          size: true,
          education_level: true,
        },
      });

      if (!existingProduct) {
        throw new NotFoundException(`Producto con ID '${id}' no encontrado`);
      }

      // Extraer propiedades de asociaciones y datos simples
      const {
        brand_id,
        category_id,
        target_audience_id,
        size_id,
        education_level_id,
        ...rest
      } = updateProductDto;

      const updateData: Partial<Product> = { ...rest };

      // Validar y actualizar relaciones si están especificadas
      if (brand_id) {
        const brand = await this.brandService.findOne(brand_id);
        if (!brand) {
          throw new NotFoundException(
            `Marca con ID '${brand_id}' no encontrada`,
          );
        }
        updateData.brand = brand;
      }

      if (category_id) {
        const category = await this.categoriesService.findOne(category_id);
        if (!category) {
          throw new NotFoundException(
            `Categoría con ID '${category_id}' no encontrada`,
          );
        }
        updateData.category = category;
      }

      if (target_audience_id) {
        const targetAudience =
          await this.targetAudiecesService.findOne(target_audience_id);
        if (!targetAudience) {
          throw new NotFoundException(
            `Público objetivo con ID '${target_audience_id}' no encontrado`,
          );
        }
        updateData.target_audience = targetAudience;
      }

      if (size_id) {
        const size = await this.sizesService.findOne(size_id);
        if (!size) {
          throw new NotFoundException(
            `Talla con ID '${size_id}' no encontrada`,
          );
        }
        updateData.size = size;
      }

      if (education_level_id) {
        const educationLevel =
          await this.educationLevelsService.findOne(education_level_id);
        if (!educationLevel) {
          throw new NotFoundException(
            `Nivel de educación con ID '${education_level_id}' no encontrado`,
          );
        }
        updateData.education_level = educationLevel;
      }

      // Actualizar el producto
      await queryRunner.manager.update(Product, id, updateData);

      // Obtener producto actualizado
      const updatedProduct = await queryRunner.manager.findOne(Product, {
        where: { id },
        relations: {
          brand: true,
          target_audience: true,
          category: true,
          size: true,
          education_level: true,
        },
      });

      // Verificar que el producto actualizado exista
      if (!updatedProduct) {
        throw new InternalServerErrorException(
          `No se pudo recuperar el producto con ID '${id}' después de la actualización`,
        );
      }

      // Confirmar cambios
      await queryRunner.commitTransaction();

      return updatedProduct;
    } catch (error: unknown) {
      // Revertir cambios en caso de error
      await queryRunner.rollbackTransaction();

      // Manejar errores específicos
      if (error instanceof NotFoundException) {
        throw error;
      }

      // Manejar errores técnicos
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';

      throw new InternalServerErrorException(
        `Error al actualizar producto con ID '${id}': ${errorMessage}`,
      );
    } finally {
      // Liberar recursos
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    // Crear un QueryRunner para controlar manualmente la transacción
    const queryRunner =
      this.productRepository.manager.connection.createQueryRunner();

    // Conectar al queryRunner
    await queryRunner.connect();

    // Iniciar la transacción
    await queryRunner.startTransaction();

    try {
      // Verificar que el producto existe antes de eliminarlo
      const product = await queryRunner.manager.findOne(Product, {
        where: { id },
        relations: {
          brand: true,
          target_audience: true,
          category: true,
          size: true,
          education_level: true,
        },
      });

      if (!product) {
        throw new NotFoundException(`Producto con ID '${id}' no encontrado`);
      }

      // Intentar eliminar el producto
      await queryRunner.manager.delete(Product, { id });

      // Si llegamos aquí sin errores, confirmar los cambios
      await queryRunner.commitTransaction();
    } catch (error: unknown) {
      // En caso de error, revertir todos los cambios realizados en la transacción
      await queryRunner.rollbackTransaction();

      // Manejar diferentes tipos de errores
      if (error instanceof NotFoundException) {
        throw error; // Reenviar errores de negocio sin modificar
      }

      // Manejar errores de forma segura con tipado correcto
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';

      // Errores de base de datos u otros errores técnicos
      throw new InternalServerErrorException(
        `Error al eliminar el producto con ID '${id}': ${errorMessage}`,
      );
    } finally {
      // SIEMPRE liberar recursos del queryRunner, independientemente del resultado
      await queryRunner.release();
    }
  }

  async findMultipleByIds(productIds: number[]): Promise<Product[]> {
    if (!productIds || productIds.length === 0) {
      return [];
    }
    return this.productRepository.findBy({
      id: In(productIds), // Usar el operador In de TypeORM
    });
  }

  async checkStock(
    productId: number,
    quantityNeeded: number,
  ): Promise<boolean> {
    const product = await this.productRepository.findOne({
      select: ['id', 'stock'], // Solo necesitamos el stock
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(
        `Producto con ID '${productId}' no encontrado para verificar stock.`,
      );
    }
    return product.stock >= quantityNeeded;
  }

  async decreaseStock(
    items: { productId: number; quantity: number }[],
    queryRunner: QueryRunner,
  ): Promise<void> {
    for (const item of items) {
      try {
        // Usamos el queryRunner para que la actualización sea parte de la transacción
        const result = await queryRunner.manager.decrement(
          Product,
          { id: item.productId, stock: MoreThanOrEqual(item.quantity) }, // Condición para evitar stock negativo (seguridad adicional)
          'stock',
          item.quantity,
        );

        // result.affected será 0 si el stock no fue suficiente o el producto no existía
        if (result.affected === 0) {
          // Volvemos a buscar para dar un error más específico
          const product = await queryRunner.manager.findOneBy(Product, {
            id: item.productId,
          });
          if (!product) {
            throw new NotFoundException(
              `Producto con ID '${item.productId}' no encontrado durante el decremento de stock.`,
            );
          }
          if (product.stock < item.quantity) {
            throw new ConflictException(
              `Stock insuficiente para el producto ID '${item.productId}'. Stock actual: ${product.stock}, requerido: ${item.quantity}.`,
            );
          }
          // Si no es ninguno de los anteriores, es un error inesperado
          throw new InternalServerErrorException(
            `No se pudo decrementar el stock para el producto ID '${item.productId}' por una razón desconocida.`,
          );
        }
        this.logger.log(
          `Stock decrementado para producto ${item.productId} en ${item.quantity}`,
        ); // Añadir un logger al servicio
      } catch (error) {
        this.logger.error(
          `Error al decrementar stock para producto ${item.productId}: ${error.message}`,
        );
        // Re-lanzamos el error para que la transacción principal haga rollback
        throw error;
      }
    }
  }

  async increaseStock(
    items: { productId: number; quantity: number }[],
    queryRunner?: QueryRunner,
  ): Promise<void> {
    const repository = queryRunner
      ? queryRunner.manager
      : this.productRepository;
    for (const item of items) {
      try {
        await repository.increment(
          Product,
          { id: item.productId },
          'stock',
          item.quantity,
        );
        this.logger.log(
          `Stock incrementado para producto ${item.productId} en ${item.quantity}`,
        );
      } catch (error) {
        this.logger.error(
          `Error al incrementar stock para producto ${item.productId}: ${error.message}`,
        );
        // Considerar qué hacer aquí. ¿Reintentar? ¿Loguear y continuar?
        // Por ahora, solo logueamos para no detener otros procesos.
      }
    }
  }
}
