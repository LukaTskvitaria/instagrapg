import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin() {
    // Initiates Facebook OAuth flow
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookCallback(@Req() req, @Res() res: Response) {
    try {
      const loginResult = await this.authService.login(req.user);
      
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
      
      // Redirect to frontend with token
      res.redirect(
        `${frontendUrl}/auth/callback?token=${loginResult.access_token}&user=${encodeURIComponent(JSON.stringify(loginResult.user))}`
      );
    } catch (error) {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
      res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent('ავტორიზაციის შეცდომა')}`);
    }
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req) {
    return {
      user: req.user,
      message: 'მომხმარებლის პროფილი წარმატებით ჩაიტვირთა'
    };
  }
}
