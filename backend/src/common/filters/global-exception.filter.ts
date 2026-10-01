import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (response.headersSent) {
      return;
    }

    // 1. Expected NestJS HttpExceptions (400, 401, 403, 404, 429, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();

      // If it's a 500+ HttpException, sanitize error details in production
      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(
          `Internal server error on [${request.method}] ${request.url}`,
          exception.stack,
        );
        return response.status(status).json({
          statusCode: status,
          message: 'Internal server error',
          error: 'Internal Server Error',
        });
      }

      // Expected client errors retain their existing structure
      if (typeof res === 'string') {
        return response.status(status).json({
          statusCode: status,
          message: res,
        });
      }
      return response.status(status).json(res);
    }

    // 2. Unexpected runtime exceptions (Prisma errors, TypeErrors, uncaught Errors)
    const err = exception as Error;
    this.logger.error(
      `Unhandled server error on [${request.method}] ${request.url}: ${err?.message || exception}`,
      err?.stack,
    );

    // Return safe generic 500 response without internal database or stack trace details
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  }
}
