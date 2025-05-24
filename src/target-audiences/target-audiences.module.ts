import { Module } from '@nestjs/common';
import { TargetAudiencesService } from './target-audiences.service';
import { TargetAudiencesController } from './target-audiences.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TargetAudience } from './entities/target-audience.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TargetAudience])],
  controllers: [TargetAudiencesController],
  providers: [TargetAudiencesService],
  exports: [TargetAudiencesService],
})
export class TargetAudiencesModule {}
