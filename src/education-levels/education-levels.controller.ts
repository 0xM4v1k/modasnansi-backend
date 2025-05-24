import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EducationLevelsService } from './education-levels.service';
import { CreateEducationLevelDto } from './dto/create-education-level.dto';
import { UpdateEducationLevelDto } from './dto/update-education-level.dto';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { PermissionsDecorator } from '@permissions/decorators/permissions.decorator';
import { PermissionsEnum } from '@permissions/enums/PermissionsEnum';
import { PermissionsGuard } from '@permissions/guards/permissions.guard';
import { EducationLevelQueryParamsDto } from './dto/education-level-query-params.dto';

@Controller('education-levels')
export class EducationLevelsController {
  constructor(
    private readonly educationLevelsService: EducationLevelsService,
  ) {}

  @PermissionsDecorator(PermissionsEnum.EDUCATION_LEVELS_CREATE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Post()
  create(@Body() createEducationLevelDto: CreateEducationLevelDto) {
    return this.educationLevelsService.create(createEducationLevelDto);
  }

  @Get()
  findAll(@Query() query: EducationLevelQueryParamsDto) {
    return this.educationLevelsService.findByQuery(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.educationLevelsService.findOne(id);
  }

  @PermissionsDecorator(PermissionsEnum.EDUCATION_LEVELS_UPDATE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEducationLevelDto: UpdateEducationLevelDto,
  ) {
    return this.educationLevelsService.update(id, updateEducationLevelDto);
  }

  @PermissionsDecorator(PermissionsEnum.EDUCATION_LEVELS_DELETE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.educationLevelsService.remove(id);
  }
}
