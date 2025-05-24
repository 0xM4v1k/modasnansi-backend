import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { File } from './entities/file.entity';
import { User } from '@users/entities/user.entity';
import { FileQueryParamsDto } from './dto/file-quey-params.dto';

@Injectable()
export class FilesService {
  private s3Client: S3Client;
  private bucketName: string;
  // Lista de extensiones permitidas
  private readonly allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];
  // Mapeo de tipos MIME a extensiones
  private readonly mimeTypeToExtension: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'application/pdf': 'pdf',
    'text/plain': 'txt',
  };

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {
    this.bucketName = this.configService.getOrThrow('AWS_S3_BUCKET');
    this.s3Client = new S3Client({
      region: this.configService.getOrThrow('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  /**
   * Valida que el tipo MIME del archivo sea permitido
   */
  private validateFileType(mimeType: string): void {
    // Verificar si el mimeType está en nuestro mapa de tipos permitidos
    const isAllowed = Object.keys(this.mimeTypeToExtension).includes(mimeType);
    if (!isAllowed) {
      throw new BadRequestException(
        `Tipo de archivo no permitido: ${mimeType}. Los tipos permitidos son: ${Object.keys(
          this.mimeTypeToExtension,
        ).join(', ')}`,
      );
    }
  }

  /**
   * Obtiene la extensión adecuada según el tipo MIME
   */
  private getExtensionFromMimeType(mimeType: string): string {
    // Verificar si el mimeType existe en nuestro mapa
    if (mimeType in this.mimeTypeToExtension) {
      return this.mimeTypeToExtension[mimeType];
    }
    return 'bin';
  }

  /**
   * Genera un nombre de archivo único y seguro
   */
  private getUniqueFileName(baseName: string, mimeType: string): string {
    // Sanitizar el nombre base: remover caracteres no alfanuméricos (excepto espacios)
    const sanitizedName = baseName
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();

    // Obtener la extensión correcta según el MIME type
    const extension = this.getExtensionFromMimeType(mimeType);

    // Crear nombre único (timestamp + nombre sanitizado + extensión)
    return `${Date.now()}-${sanitizedName}.${extension}`;
  }

  /**
   * Extrae de forma segura la clave del archivo desde una URL de S3
   */
  private extractKeyFromUrl(url: string): string {
    try {
      // Usar regex para obtener el nombre del archivo desde la URL
      const regex = /amazonaws\.com\/([^?#]+)/;
      const match = url.match(regex);

      if (!match || !match[1]) {
        throw new Error('Formato de URL inválido');
      }

      return match[1];
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        `No se pudo extraer la clave del archivo desde la URL: ${url}`,
      );
    }
  }

  async upload(
    originalFile: Express.Multer.File,
    userId: number,
    fileDto?: CreateFileDto,
  ): Promise<File> {
    try {
      // Extraer información del archivo
      const { originalname, buffer, mimetype, size } = originalFile;

      // Validar el tipo de archivo
      this.validateFileType(mimetype);

      // Generar un título amigable si no se proporciona
      const title = fileDto?.title || originalname.replace(/\.[^/.]+$/, '');

      // Generar timestamp para el nombre de archivo
      const now = new Date();
      const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

      // Sanitizar el nombre para generar un nombre de archivo seguro
      const sanitizedTitle = title
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '_')
        .toLowerCase();

      // Crear nombre único
      const uniqueFileName = `${timestamp}-${sanitizedTitle}.${this.getExtensionFromMimeType(mimetype)}`;

      // Subir el archivo a S3
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: uniqueFileName,
          Body: buffer,
          ContentType: mimetype,
        }),
      );

      // Generar la URL pública
      const publicUrl = `https://${this.bucketName}.s3.amazonaws.com/${uniqueFileName}`;

      // Crear registro en la base de datos
      const newFile = this.fileRepository.create({
        title: title,
        filename: originalname,
        description: fileDto?.description || '',
        url: publicUrl,
        mimeType: mimetype,
        size: size,
        creator: { id: userId } as User,
      });

      return await this.fileRepository.save(newFile);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al subir archivo: ${message}`,
      );
    }
  }

  async find(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: File[]; pagination: any }> {
    const skip = (page - 1) * limit;

    const [files, total_items] = await this.fileRepository.findAndCount({
      where: { is_deleted: false },
      relations: ['creator', 'updater'],
      skip,
      take: limit,
      order: { date_created: 'DESC' },
    });

    const pagination = {
      total_items,
      total_pages: Math.ceil(total_items / limit),
      current_page: page,
      items_per_page: limit,
    };

    return { data: files, pagination };
  }

  async findByQuery(queryParams: FileQueryParamsDto) {
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 10;
    const skip = (page - 1) * limit;

    const whereOptions: FindOptionsWhere<File> = {};

    if (queryParams.title) {
      whereOptions.title = queryParams.title;
    }

    if (queryParams.description) {
      whereOptions.description = queryParams.description;
    }

    const sortOrder = queryParams.sortOrder || 'DESC';
    const sortBy = queryParams.sortBy || 'date_updated';

    const findOptions = {
      skip,
      take: limit,
      where: whereOptions,
      order: { [sortBy]: sortOrder },
    };

    const [files, total_items] =
      await this.fileRepository.findAndCount(findOptions);

    const pagination = {
      total_items,
      total_pages: Math.ceil(total_items / limit),
      current_page: page,
      items_per_page: limit,
    };

    return { data: files, pagination };
  }

  async findOne(id: number): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { id },
      relations: ['creator', 'updater'],
    });

    if (!file) {
      throw new NotFoundException(`Archivo con ID ${id} no encontrado`);
    }

    return file;
  }

  async update(
    id: number,
    updateFileDto: UpdateFileDto,
    userId: number,
  ): Promise<File> {
    const file = await this.findOne(id);

    // Actualizar sólo los metadatos (título, descripción)
    if (updateFileDto.title) {
      // Validar que no tenga extensión para evitar inconsistencias
      if (/\.\w+$/.test(updateFileDto.title)) {
        throw new BadRequestException(
          'El título del archivo no debe incluir extensión, ésta se maneja automáticamente',
        );
      }
      file.title = updateFileDto.title;
    }

    if (updateFileDto.description !== undefined) {
      file.description = updateFileDto.description;
    }

    file.updater = { id: userId } as User;

    return await this.fileRepository.save(file);
  }

  async remove(id: number, userId: number): Promise<void> {
    const file = await this.findOne(id);

    try {
      // Extraer la clave de S3 desde la URL
      const fileKey = this.extractKeyFromUrl(file.url);

      // Eliminar archivo de S3
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: fileKey,
        }),
      );

      // Marcar como eliminado en la base de datos
      file.is_deleted = true;
      file.date_deleted = new Date();
      file.deleter = { id: userId } as User;

      await this.fileRepository.save(file);

      await this.fileRepository.delete({
        id,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // Re-lanzar errores de validación
      }

      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new InternalServerErrorException(
        `Error al eliminar archivo: ${message}`,
      );
    }
  }
}
