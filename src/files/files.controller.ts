import {
  Controller,
  UploadedFile,
  ParseFilePipe,
  Post,
  Get,
  Query,
  UseInterceptors,
  FileTypeValidator,
  UseGuards,
  Body,
  ParseIntPipe,
  Delete,
  Param,
  Patch,
  Request,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { PermissionsDecorator } from '@permissions/decorators/permissions.decorator';
import { PermissionsEnum } from '@permissions/enums/PermissionsEnum';
import { PermissionsGuard } from '@permissions/guards/permissions.guard';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileQueryParamsDto } from './dto/file-quey-params.dto';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @PermissionsDecorator(PermissionsEnum.FILES_CREATE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|pdf)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() createFileDto: CreateFileDto,
    @Request() req,
  ) {
    return await this.filesService.upload(
      file,
      Number(req.user.sub),
      createFileDto,
    );
  }

  @PermissionsDecorator(PermissionsEnum.FILES_READ)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get()
  async findAll(@Query() queryParams: FileQueryParamsDto) {
    return await this.filesService.findByQuery(queryParams);
  }

  @PermissionsDecorator(PermissionsEnum.FILES_READ)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.filesService.findOne(id);
  }

  @PermissionsDecorator(PermissionsEnum.FILES_UPDATE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFileDto: UpdateFileDto,
    @Request() req,
  ) {
    return await this.filesService.update(
      id,
      updateFileDto,
      Number(req.user.sub),
    );
  }

  @PermissionsDecorator(PermissionsEnum.FILES_DELETE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return await this.filesService.remove(id, Number(req.user.sub));
  }
}
