import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaService } from './prisma.service';
import { ContactController } from './contact/contact.controller';
import { ContactService } from './contact/contact.service';
import { PublicApiController } from './public-api/public-api.controller';
import { PublicApiService } from './public-api/public-api.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // Limit each IP to 100 requests per minute by default
    }]),
  ],
  controllers: [
    ContactController,
    PublicApiController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    PrismaService,
    ContactService,
    PublicApiService,
  ],
})
export class AppModule {}
