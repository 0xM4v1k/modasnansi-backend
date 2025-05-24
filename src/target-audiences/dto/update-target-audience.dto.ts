import { PartialType } from '@nestjs/mapped-types';
import { CreateTargetAudienceDto } from './create-target-audience.dto';

export class UpdateTargetAudienceDto extends PartialType(
  CreateTargetAudienceDto,
) {}
