import { Controller, Post, Body, Headers, HttpCode, HttpStatus, UnauthorizedException, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: any) {
    const { email, password } = body;
    if (!email || !password) {
      throw new UnauthorizedException('Email and password are required');
    }
    return this.authService.login(email, password);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Headers('authorization') authHeader: string) {
    if (!authHeader) {
      return { success: true };
    }
    const token = authHeader.replace('Bearer ', '');
    return this.authService.logout(token);
  }

  @Get('session')
  async getSession(@Headers('authorization') authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }
    const token = authHeader.replace('Bearer ', '');
    const session = this.authService.getSession(token);
    if (!session) {
      throw new UnauthorizedException('Invalid session');
    }
    return session;
  }
}
