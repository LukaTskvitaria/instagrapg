import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('accounts/:accountId/overview')
  async getAccountOverview(@Param('accountId') accountId: string) {
    const overview = await this.analyticsService.getAccountOverview(accountId);
    
    return {
      success: true,
      data: overview,
    };
  }

  @Get('accounts/:accountId/content')
  async getContentAnalytics(@Param('accountId') accountId: string) {
    const analytics = await this.analyticsService.getContentAnalytics(accountId);
    
    return {
      success: true,
      data: analytics,
    };
  }

  @Get('accounts/:accountId/engagement')
  async getEngagementAnalytics(@Param('accountId') accountId: string) {
    const analytics = await this.analyticsService.getEngagementAnalytics(accountId);
    
    return {
      success: true,
      data: analytics,
    };
  }
}
