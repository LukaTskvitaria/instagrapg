import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      message: 'InstaGraph Backend is running!',
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  getRoot() {
    return {
      message: 'InstaGraph API - Instagram Growth Assistant',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        instagram: '/api/instagram',
        analytics: '/api/analytics',
        recommendations: '/api/recommendations',
      },
    };
  }
}
