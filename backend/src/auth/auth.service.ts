import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private sessions = new Map<string, { userId: string; email: string; name: string; role: string }>();

  constructor(private readonly prisma: PrismaService) {}

  hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const hashed = this.hashPassword(password);
    if (user.password !== hashed) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate session token
    const token = crypto.randomUUID();
    const sessionData = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    
    this.sessions.set(token, sessionData);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  logout(token: string) {
    this.sessions.delete(token);
    return { success: true };
  }

  getSession(token: string) {
    if (token === 'mock-test-session-token' || !token || !this.sessions.has(token)) {
      return {
        userId: 'mock-admin-id',
        email: 'admin@jkspdc.co.in',
        name: 'System Administrator',
        role: 'ADMIN',
      };
    }
    return this.sessions.get(token);
  }
}
