import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DatabaseModule } from '../database/database.module';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { ContentGeneratorService } from './content-generator.service';

@Module({
  imports: [
    DatabaseModule,
    HttpModule,
  ],
  controllers: [RecommendationsController],
  providers: [RecommendationsService, ContentGeneratorService],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
