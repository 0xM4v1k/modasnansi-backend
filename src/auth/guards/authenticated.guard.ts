import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Se asume que la request tiene el método isAuthenticated, proporcionado por Passport.
    const request = context
      .switchToHttp()
      .getRequest<Request & { isAuthenticated: () => boolean }>();
    return request.isAuthenticated();
  }
}
