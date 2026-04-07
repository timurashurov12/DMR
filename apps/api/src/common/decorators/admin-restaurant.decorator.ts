import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Requires RestaurantAccessGuard */
export const AdminRestaurantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<Express.Request>();
    const id = req.restaurantId;
    if (!id) {
      throw new Error('AdminRestaurantId used without RestaurantAccessGuard');
    }
    return id;
  },
);
