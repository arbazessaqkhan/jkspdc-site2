import { Module, Global } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RolesGuard } from './roles.guard';
import { PrismaService } from '../prisma.service';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, RolesGuard],
  exports: [AuthService, RolesGuard],
})
export class AuthModule {}

