import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new ForbiddenException('User role is not defined or unauthenticated');
    }

    const userRoleName = user.role.name.toLowerCase();
    const hasRole = requiredRoles.some((role) => role.toLowerCase() === userRoleName);

    if (!hasRole) {
      throw new ForbiddenException(
        `Role '${user.role.name}' is not authorized to access this resource`,
      );
    }

    return true;
  }
}
