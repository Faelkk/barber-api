import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';

export const activeBarberShop = createParamDecorator<undefined>(
  (data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const barbershop = request.barbershop;

    if (!barbershop) {
      throw new UnauthorizedException();
    }

    const barbershopUserId = barbershop;

    return barbershopUserId;
  },
);
