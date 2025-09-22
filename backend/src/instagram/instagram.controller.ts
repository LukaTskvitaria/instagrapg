import { Controller, Get, Post, UseGuards, Req, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InstagramService } from './instagram.service';

@Controller('instagram')
@UseGuards(AuthGuard('jwt'))
export class InstagramController {
  constructor(private instagramService: InstagramService) {}

  @Post('connect')
  async connectAccount(@Req() req) {
    const { facebookAccessToken } = req.body;
    const account = await this.instagramService.connectInstagramAccount(
      req.user.id,
      facebookAccessToken,
    );
    
    return {
      success: true,
      message: 'Instagram ანგარიში წარმატებით დაკავშირდა',
      account: {
        id: account.id,
        username: account.username,
        name: account.name,
        followersCount: account.followersCount,
      },
    };
  }

  @Get('accounts/:accountId/analytics')
  async getAccountAnalytics(@Param('accountId') accountId: string) {
    const analytics = await this.instagramService.getAccountAnalytics(accountId);
    
    return {
      success: true,
      data: analytics,
    };
  }

  @Post('accounts/:accountId/refresh-insights')
  async refreshInsights(@Param('accountId') accountId: string) {
    await this.instagramService.fetchAccountInsights(accountId);
    await this.instagramService.fetchMediaInsights(accountId);
    
    return {
      success: true,
      message: 'ანალიტიკა განახლდა',
    };
  }
}
