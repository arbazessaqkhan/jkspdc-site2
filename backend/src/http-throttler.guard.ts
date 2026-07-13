import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Custom ThrottlerGuard that skips OPTIONS preflight requests.
 * The default ThrottlerGuard intercepts CORS preflight (OPTIONS) requests
 * and can crash before CORS headers are applied, causing browsers to report
 * "CORS error" instead of the real underlying HTTP error.
 */
@Injectable()
export class HttpThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // Skip throttling for OPTIONS preflight requests so CORS works correctly
    if (request.method === 'OPTIONS') {
      return true;
    }
    return super.shouldSkip(context);
  }
}
