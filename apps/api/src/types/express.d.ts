import 'express';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
    }
    interface Request {
      publicRestaurantId?: string;
      restaurantId?: string;
    }
  }
}

export {};
