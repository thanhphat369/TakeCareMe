import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../../entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu không có required roles, cho phép tất cả authenticated users
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Kiểm tra nếu user không tồn tại hoặc không có role
    if (!user || !user.role) {
      throw new ForbiddenException('Bạn không có quyền truy cập chức năng này');
    }

    // So sánh role (enum value là string)
    const userRole = String(user.role);
    const hasRole = requiredRoles.some((requiredRole) => {
      const requiredRoleStr = String(requiredRole);
      return userRole === requiredRoleStr;
    });
    
    if (!hasRole) {
      console.log('RolesGuard: Access denied', {
        userRole: user.role,
        requiredRoles,
        userId: user.userId,
      });
      throw new ForbiddenException('Bạn không có quyền truy cập chức năng này');
    }

    return true;
  }
}
