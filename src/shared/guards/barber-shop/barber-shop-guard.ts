import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class BarberShopAccessGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skipCheck = this.reflector.get<boolean>(
      'skipBarberShopIdCheck',
      context.getHandler(),
    );

    if (skipCheck) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const barberShopUserId = request.barbershop;
    const barberShopId = request.query.barberShopId;

    if (!barberShopUserId || barberShopUserId !== barberShopId) {
      throw new ForbiddenException('Access denied to this barbershop');
    }

    return true;
  }
}
