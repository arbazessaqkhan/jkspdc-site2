import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
  Get,
  Header,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store, private')
  @Header('Pragma', 'no-cache')
  async login(@Body() body: any, @Req() req: any) {
    const { email, password } = body;
    if (!email || !password) {
      throw new UnauthorizedException('Email and password are required');
    }
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    return this.authService.login(email, password, ip, ua);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('mfa/authorize-enrollment')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store, private')
  @Header('Pragma', 'no-cache')
  async mfaAuthorizeEnrollment(@Body() body: any, @Req() req: any) {
    const { ticket, enrollmentCode } = body;
    if (!ticket || !enrollmentCode) {
      throw new BadRequestException('Challenge ticket and enrolment authorization code are required');
    }
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    return this.authService.mfaAuthorizeEnrollment(ticket, enrollmentCode, ip, ua);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('mfa/setup-confirm')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store, private')
  @Header('Pragma', 'no-cache')
  async mfaSetupConfirm(@Body() body: any, @Req() req: any) {
    const { ticket, code } = body;
    if (!ticket || !code) {
      throw new BadRequestException('Challenge ticket and verification code are required');
    }
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    return this.authService.mfaSetupConfirm(ticket, code, ip, ua);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store, private')
  @Header('Pragma', 'no-cache')
  async mfaVerify(@Body() body: any, @Req() req: any) {
    const { ticket, code, isRecoveryCode } = body;
    if (!ticket || !code) {
      throw new BadRequestException('Challenge ticket and authentication code are required');
    }
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    return this.authService.mfaVerify(ticket, code, !!isRecoveryCode, ip, ua);
  }

  @UseGuards(AuthGuard)
  @Post('mfa/regenerate-recovery-codes')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store, private')
  @Header('Pragma', 'no-cache')
  async regenerateRecoveryCodes(@Body() body: any, @Req() req: any) {
    const { code } = body;
    if (!code) {
      throw new BadRequestException('Current TOTP code is required for re-authentication');
    }
    const user = req.user;
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    return this.authService.regenerateRecoveryCodes(user.userId, code, ip, ua);
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
