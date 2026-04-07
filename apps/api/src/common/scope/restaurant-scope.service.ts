import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RestaurantScopeService {
  constructor(private prisma: PrismaService) {}

  async assertMenuInRestaurant(menuId: string, restaurantId: string) {
    const m = await this.prisma.menu.findFirst({
      where: { id: menuId, restaurantId },
    });
    if (!m) throw new NotFoundException('Menu not found');
    return m;
  }

  async assertMenuTypeInRestaurant(menuTypeId: string, restaurantId: string) {
    const mt = await this.prisma.menuType.findFirst({
      where: { id: menuTypeId, menu: { restaurantId } },
      include: { menu: true },
    });
    if (!mt) throw new NotFoundException('Menu type not found');
    return mt;
  }

  async assertCategoryInRestaurant(categoryId: string, restaurantId: string) {
    const cat = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        menuType: { menu: { restaurantId } },
      },
      include: { menuType: true },
    });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async assertMenuItemInRestaurant(menuItemId: string, restaurantId: string) {
    const item = await this.prisma.menuItem.findFirst({
      where: {
        id: menuItemId,
        category: { menuType: { menu: { restaurantId } } },
      },
    });
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }
}
