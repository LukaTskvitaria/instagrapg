import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { InstagramService } from '../instagram.service';

@Processor('insights')
export class InsightsProcessor {
  private readonly logger = new Logger(InsightsProcessor.name);

  constructor(private instagramService: InstagramService) {}

  @Process('fetch-account-insights')
  async handleAccountInsights(job: Job<{ accountId: string }>) {
    const { accountId } = job.data;
    this.logger.log(`Processing account insights for account: ${accountId}`);
    
    try {
      await this.instagramService.fetchAccountInsights(accountId);
      this.logger.log(`Account insights processed successfully for: ${accountId}`);
    } catch (error) {
      this.logger.error(`Failed to process account insights for: ${accountId}`, error.stack);
      throw error;
    }
  }

  @Process('fetch-media-insights')
  async handleMediaInsights(job: Job<{ accountId: string }>) {
    const { accountId } = job.data;
    this.logger.log(`Processing media insights for account: ${accountId}`);
    
    try {
      await this.instagramService.fetchMediaInsights(accountId);
      this.logger.log(`Media insights processed successfully for: ${accountId}`);
    } catch (error) {
      this.logger.error(`Failed to process media insights for: ${accountId}`, error.stack);
      throw error;
    }
  }
}
