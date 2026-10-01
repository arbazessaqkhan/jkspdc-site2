import { Controller, Post, Body, Headers, HttpCode, HttpStatus, UnauthorizedException, Get, Header } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store, private')
  @Header('Pragma', 'no-cache')
  async login(@Body() body: any) {
    const { email, password } = body;
    if (!email || !password) {
      throw new UnauthorizedException('Email and password are required');
    }
    return this.authService.login(email, password);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store, private')
  @Header('Pragma', 'no-cache')
  async logout(@Headers('authorization') authHeader: string) {
    if (!authHeader) {
      return { success: true };
    }
    const token = authHeader.replace('Bearer ', '');
    return await this.authService.logout(token);
  }

  @Get('session')
  @Header('Cache-Control', 'no-store, private')
  @Header('Pragma', 'no-cache')
  async getSession(@Headers('authorization') authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }
    const token = authHeader.replace('Bearer ', '');
    const session = await this.authService.getSession(token);
    if (!session) {
      throw new UnauthorizedException('Invalid session');
    }
    return session;
  }
}
