import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';

/**
 * Enterprise ThrottlerGuard providing dual-layer rate limiting:
 * 1. IP-based throttling to defend against single-origin flooding.
 * 2. Account-based throttling using normalized email identifiers to prevent
 *    distributed credential stuffing across rotating proxy IP addresses.
 * 3. Graceful preflight (OPTIONS) bypass so CORS headers are preserved.
 */
@Injectable()
export class HttpThrottlerGuard extends ThrottlerGuard {
  // Sliding-window record for account-based throttling (5 attempts per 60 seconds per account)
  private static readonly accountAttempts = new Map<string, { count: number; resetAt: number }>();
  private static lastPrune = Date.now();

  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Rely on trusted proxy resolution (Express req.ip) rather than raw user-supplied headers
    return req.ip || req.socket?.remoteAddress || '127.0.0.1';
  }

  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // Skip throttling for OPTIONS preflight requests so CORS works correctly
    if (request.method === 'OPTIONS') {
      return true;
    }
    return super.shouldSkip(context);
  }

  async handleRequest(requestProps: any): Promise<boolean> {
    const context = requestProps.context;
    const req = context.switchToHttp().getRequest();

    // Enforce account-based rate limiting on primary login endpoint
    if (req.method === 'POST' && req.url && req.url.includes('/auth/login')) {
      const email = req.body?.email ? String(req.body.email).toLowerCase().trim() : null;
      if (email) {
        const now = Date.now();
        const accountKey = `login_account:${email}`;
        let entry = HttpThrottlerGuard.accountAttempts.get(accountKey);

        if (!entry || now > entry.resetAt) {
          entry = { count: 1, resetAt: now + 60000 };
          HttpThrottlerGuard.accountAttempts.set(accountKey, entry);
        } else {
          entry.count++;
          if (entry.count > 5) {
            throw new ThrottlerException(
              'Too many login attempts for this account across distributed origins. Please wait 60 seconds before trying again.',
            );
          }
        }

        // Periodic pruning of stale account entries every 5 minutes
        if (now - HttpThrottlerGuard.lastPrune > 300000) {
          HttpThrottlerGuard.lastPrune = now;
          for (const [key, val] of HttpThrottlerGuard.accountAttempts.entries()) {
            if (now > val.resetAt) {
              HttpThrottlerGuard.accountAttempts.delete(key);
            }
          }
        }
      }
    }

    // Evaluate standard IP-level rate limiting
    return super.handleRequest(requestProps);
  }
}
