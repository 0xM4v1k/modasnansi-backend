import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TargetAudiencesService } from './target-audiences.service';
import { CreateTargetAudienceDto } from './dto/create-target-audience.dto';
import { UpdateTargetAudienceDto } from './dto/update-target-audience.dto';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { PermissionsDecorator } from '@permissions/decorators/permissions.decorator';
import { PermissionsEnum } from '@permissions/enums/PermissionsEnum';
import { PermissionsGuard } from '@permissions/guards/permissions.guard';
import { TargetAudienceQueryParamsDto } from './dto/target-audience-query-params.dto';

@Controller('target-audiences')
export class TargetAudiencesController {
  constructor(
    private readonly targetAudiencesService: TargetAudiencesService,
  ) {}

  @PermissionsDecorator(PermissionsEnum.TARGET_AUDIENCES_CREATE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Post()
  create(@Body() createTargetAudienceDto: CreateTargetAudienceDto) {
    return this.targetAudiencesService.create(createTargetAudienceDto);
  }

  @Get()
  findAll(@Query() query: TargetAudienceQueryParamsDto) {
    return this.targetAudiencesService.findByQuery(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.targetAudiencesService.findOne(id);
  }

  @PermissionsDecorator(PermissionsEnum.TARGET_AUDIENCES_UPDATE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTargetAudienceDto: UpdateTargetAudienceDto,
  ) {
    return this.targetAudiencesService.update(id, updateTargetAudienceDto);
  }

  @PermissionsDecorator(PermissionsEnum.TARGET_AUDIENCES_DELETE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.targetAudiencesService.remove(id);
  }
}
