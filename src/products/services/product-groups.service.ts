import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductGroup } from '../entities/product-group.entity';
import { CreateProductGroupDto } from '../dto/create-product-group.dto';
import { UpdateProductGroupDto } from '../dto/update-product-group.dto';
import { FindAllResultDto } from 'src/common/dto/find-all-result.dto';
import { PaginationDTO } from 'src/common/dto/pagination.dto';
import { BrandsService } from 'src/brands/brands.service';
import { CategoriesService } from 'src/categories/categories.service';
import { TargetAudiencesService } from 'src/target-audiences/target-audiences.service';
import { ProductGroupQueryParamsDto } from '../dto/product-group-query-params.dto';

@Injectable()
export class ProductGroupsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(ProductGroup)
    private productGroupRepository: Repository<ProductGroup>,
    private readonly targetAudiencesService: TargetAudiencesService,
    private readonly brandsService: BrandsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(productGroupDto: CreateProductGroupDto): Promise<ProductGroup> {
    // Crear QueryRunner para manejar la transacción
    const queryRunner =
      this.productGroupRepository.manager.connection.createQueryRunner();

    // Conectar y comenzar transacción
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validar productos de variación
      const productVariations: Product[] = await queryRunner.manager.find(
        Product,
        {
          where: { id: In(productGroupDto.variation_ids) },
        },
      );

      if (productVariations.length !== productGroupDto.variation_ids.length) {
        const missingIds = productGroupDto.variation_ids.filter(
          (id) => !productVariations.some((p) => p.id === id),
        );
        throw new BadRequestException(
          `No se encontraron los productos con IDs: ${missingIds.join(', ')}`,
        );
      }

      // Validar productos recomendados
      const recommendedProducts: Product[] = await queryRunner.manager.find(
        Product,
        {
          where: { id: In(productGroupDto.recommended_product_ids) },
        },
      );

      if (
        recommendedProducts.length !==
        productGroupDto.recommended_product_ids.length
      ) {
        const missingIds = productGroupDto.recommended_product_ids.filter(
          (id) => !recommendedProducts.some((p) => p.id === id),
        );
        throw new BadRequestException(
          `No se encontraron los productos recomendados con IDs: ${missingIds.join(', ')}`,
        );
      }

      // Validar categoría
      const category = await this.categoriesService.findOne(
        productGroupDto.category_id,
      );
      if (!category) {
        throw new NotFoundException(
          `Categoría con ID '${productGroupDto.category_id}' no encontrada`,
        );
      }

      // Validar marca
      const brand = await this.brandsService.findOne(productGroupDto.brand_id);
      if (!brand) {
        throw new NotFoundException(
          `Marca con ID '${productGroupDto.brand_id}' no encontrada`,
        );
      }

      // Validar público objetivo
      const target_audience = await this.targetAudiencesService.findOne(
        productGroupDto.target_audience_id,
      );
      if (!target_audience) {
        throw new NotFoundException(
          `Público objetivo con ID '${productGroupDto.target_audience_id}' no encontrado`,
        );
      }

      // Crear el nuevo grupo de productos
      const newProductGroup = queryRunner.manager.create(ProductGroup, {
        ...productGroupDto,
        variations: productVariations,
        recommended_products: recommendedProducts,
        brand,
        target_audience,
        category,
      });

      const savedGroup = await queryRunner.manager.save(newProductGroup);

      // Confirmar transacción
      await queryRunner.commitTransaction();

      return savedGroup;
    } catch (error) {
      // Revertir transacción en caso de error
      await queryRunner.rollbackTransaction();

      // Reenviar errores de negocio
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Manejar errores técnicos
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException(
        `Error al crear grupo de productos: ${errorMessage}`,
      );
    } finally {
      // Liberar recursos
      await queryRunner.release();
    }
  }

  async findByQuery(
    queryParams: ProductGroupQueryParamsDto,
  ): Promise<FindAllResultDto<ProductGroup>> {
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 10;
    const skip = (page - 1) * limit;

    const whereOptions: FindOptionsWhere<ProductGroup> = {};

    if (queryParams.name) {
      whereOptions.name = queryParams.name;
    }

    if (queryParams.description) {
      whereOptions.description = queryParams.description;
    }

    if (queryParams.category_name) {
      whereOptions.category = { name: queryParams.category_name };
    }

    if (queryParams.target_audience_name) {
      whereOptions.target_audience = { name: queryParams.target_audience_name };
    }

    if (queryParams.brand_name) {
      whereOptions.brand = { name: queryParams.brand_name };
    }

    const sortOrder = queryParams.sortOrder || 'DESC';
    const sortBy = queryParams.sortBy || 'date_updated';

    const [productGroups, total] =
      await this.productGroupRepository.findAndCount({
        skip,
        take: limit,
        where: whereOptions,
        order: { [sortBy]: sortOrder },
        relations: {
          brand: true,
          category: true,
          target_audience: true,
          variations: {
            brand: true,
            size: true,
            target_audience: true,
            category: true,
            education_level: true,
          },
          recommended_products: true,
        },
      });

    const pagination: PaginationDTO = {
      total_items: total,
      total_pages: Math.ceil(total / limit),
      current_page: page,
      items_per_page: limit,
    };

    return { data: productGroups, pagination };
  }

  async findOne(id: number): Promise<ProductGroup> {
    const productGroup = await this.productGroupRepository.findOne({
      where: { id },
      relations: {
        brand: true,
        category: true,
        target_audience: true,
        variations: {
          brand: true,
          size: true,
          target_audience: true,
          category: true,
          education_level: true,
        },
        recommended_products: true,
      },
    });

    if (!productGroup) {
      throw new NotFoundException(`Product group with id ${id} not found`);
    }

    return productGroup;
  }

  async update(
    id: number,
    updateProductGroupDto: UpdateProductGroupDto,
  ): Promise<ProductGroup> {
    const productGroup = await this.productGroupRepository.findOne({
      where: { id },
      relations: {
        variations: true,
        recommended_products: true,
      },
    });

    if (!productGroup) {
      throw new NotFoundException(`Product group with id ${id} not found`);
    }

    const updateData: Partial<ProductGroup> = {};

    // Copiar propiedades básicas
    if (updateProductGroupDto.name !== undefined)
      updateData.name = updateProductGroupDto.name;
    if (updateProductGroupDto.description !== undefined)
      updateData.description = updateProductGroupDto.description;
    if (updateProductGroupDto.image !== undefined)
      updateData.image = updateProductGroupDto.image;

    // Manejar variaciones solo si se proporcionan
    if (
      updateProductGroupDto.variation_ids &&
      updateProductGroupDto.variation_ids.length > 0
    ) {
      const productVariations: Product[] = await this.productRepository.find({
        where: { id: In(updateProductGroupDto.variation_ids) },
      });

      if (
        productVariations.length !== updateProductGroupDto.variation_ids.length
      ) {
        throw new BadRequestException(
          'IDs de variaciones de productos inválidos',
        );
      }

      updateData.variations = productVariations;
    }

    // Manejar productos recomendados solo si se proporcionan
    if (
      updateProductGroupDto.recommended_product_ids &&
      updateProductGroupDto.recommended_product_ids.length > 0
    ) {
      const recommendedProducts: Product[] = await this.productRepository.find({
        where: { id: In(updateProductGroupDto.recommended_product_ids) },
      });

      if (
        recommendedProducts.length !==
        updateProductGroupDto.recommended_product_ids.length
      ) {
        throw new BadRequestException(
          'IDs de productos recomendados inválidos',
        );
      }

      updateData.recommended_products = recommendedProducts;
    }

    // Actualizar la categoría, marca y audiencia objetivo solo si se proporcionan
    if (updateProductGroupDto.category_id !== undefined) {
      const category = await this.categoriesService.findOne(
        updateProductGroupDto.category_id,
      );

      if (!category) {
        throw new NotFoundException('Categoría no encontrada');
      }

      updateData.category = category;
    }

    if (updateProductGroupDto.brand_id !== undefined) {
      const brand = await this.brandsService.findOne(
        updateProductGroupDto.brand_id,
      );

      if (!brand) {
        throw new NotFoundException('Marca no encontrada');
      }

      updateData.brand = brand;
    }

    if (updateProductGroupDto.target_audience_id !== undefined) {
      const targetAudience = await this.targetAudiencesService.findOne(
        updateProductGroupDto.target_audience_id,
      );

      if (!targetAudience) {
        throw new NotFoundException('Audiencia objetivo no encontrada');
      }

      updateData.target_audience = targetAudience;
    }

    // Mezclar el grupo existente con datos actualizados
    const updatedProductGroup = this.productGroupRepository.merge(
      productGroup,
      updateData,
    );

    return await this.productGroupRepository.save(updatedProductGroup);
  }

  async remove(id: number): Promise<void> {
    // Cargar el grupo con sus relaciones
    const productGroup = await this.productGroupRepository.findOne({
      where: { id },
      relations: {
        variations: true,
        recommended_products: true,
      },
    });

    if (!productGroup) {
      throw new NotFoundException(`Product group with id ${id} not found`);
    }

    try {
      // 1. Desasociar todas las variaciones de productos
      if (productGroup.variations && productGroup.variations.length > 0) {
        // Opción 1: Actualizando cada producto individualmente
        for (const product of productGroup.variations) {
          product.product_group = null; // Usar null en lugar de undefined
          await this.productRepository.save(product);
        }

        // Alternativa: Usar SQL directo (más eficiente)
        // await this.productRepository
        //   .createQueryBuilder()
        //   .update(Product)
        //   .set({ product_group: null })
        //   .where("product_group_id = :id", { id })
        //   .execute();
      }

      // 2. Desasociar productos recomendados (relación many-to-many)
      if (
        productGroup.recommended_products &&
        productGroup.recommended_products.length > 0
      ) {
        productGroup.recommended_products = [];
        await this.productGroupRepository.save(productGroup);
      }

      // 3. Ahora sí podemos eliminar el grupo de productos con seguridad
      await this.productGroupRepository.remove(productGroup);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';

      throw new BadRequestException(
        `Error al eliminar el grupo de productos: ${errorMessage}`,
      );
    }
  }
}
