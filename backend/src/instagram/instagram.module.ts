import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { DatabaseModule } from '../database/database.module';
import { InstagramController } from './instagram.controller';
import { InstagramService } from './instagram.service';
import { InsightsProcessor } from './processors/insights.processor';

@Module({
  imports: [
    DatabaseModule,
    HttpModule,
    BullModule.registerQueue({
      name: 'insights',
    }),
  ],
  controllers: [InstagramController],
  providers: [InstagramService, InsightsProcessor],
  exports: [InstagramService],
})
export class InstagramModule {}
