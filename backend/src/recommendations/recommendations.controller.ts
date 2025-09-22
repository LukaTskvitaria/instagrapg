import { Controller, Get, Post, Put, UseGuards, Param, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RecommendationsService } from './recommendations.service';
import { RecommendationStatus } from '../database/entities';

@Controller('recommendations')
@UseGuards(AuthGuard('jwt'))
export class RecommendationsController {
  constructor(private recommendationsService: RecommendationsService) {}

  @Post('accounts/:accountId/generate')
  async generateRecommendations(@Param('accountId') accountId: string) {
    const recommendations = await this.recommendationsService.generateRecommendations(accountId);
    
    return {
      success: true,
      message: 'რეკომენდაციები წარმატებით გენერირდა',
      data: recommendations,
    };
  }

  @Get('accounts/:accountId')
  async getRecommendations(@Param('accountId') accountId: string) {
    const recommendations = await this.recommendationsService.getRecommendations(
      accountId,
      RecommendationStatus.ACTIVE,
    );
    
    return {
      success: true,
      data: recommendations,
    };
  }

  @Put(':recommendationId/status')
  async updateRecommendationStatus(
    @Param('recommendationId') recommendationId: string,
    @Body() body: { status: RecommendationStatus },
  ) {
    await this.recommendationsService.updateRecommendationStatus(
      recommendationId,
      body.status,
    );
    
    return {
      success: true,
      message: 'რეკომენდაციის სტატუსი განახლდა',
    };
  }
}
