import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from './roles.enum';

const VALID_ROLES = new Set<string>([Role.ADMIN, Role.EDITOR, Role.VIEWER]);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<(Role | string)[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are specified on the route handler or class, allow through
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Fail closed: Authentication must have preceded this guard
    if (!user) {
      throw new UnauthorizedException('Authentication required before role verification');
    }

    const userRole = user.role;

    // Fail closed: Role must be a recognized system role
    if (!userRole || typeof userRole !== 'string' || !VALID_ROLES.has(userRole)) {
      throw new ForbiddenException('User has an invalid or unrecognized role');
    }

    // Authorization check: Verify if the user's role matches any required role
    const hasRole = requiredRoles.includes(userRole as Role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Access forbidden: Required role [${requiredRoles.join(', ')}], user role is [${userRole}]`,
      );
    }

    return true;
  }
}
