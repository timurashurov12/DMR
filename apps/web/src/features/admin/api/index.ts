// Re-export all API functions and types for backward compatibility
// Previously located in lib/api.ts, now split across domain modules

export { RESTAURANT_STORAGE_KEY, getSelectedRestaurantId, setSelectedRestaurantId } from './_client';

export { login } from './auth.api';

export {
  fetchRestaurants,
  fetchRestaurantDomains,
  addRestaurantDomain,
  removeRestaurantDomain,
  fetchMenusAdmin,
  createMenu,
  updateMenu,
  deleteMenu,
  type MenuDto,
} from './restaurants.api';

export {
  fetchMenuTypesAdmin,
  createMenuType,
  updateMenuType,
  uploadMenuTypeImage,
  deleteMenuType,
  bulkDeleteMenuTypes,
  translateMenuType,
  bulkTranslateMenuTypes,
  getTranslateResultMessage,
  type TranslateResult,
  type BulkTranslateResult,
} from './menuTypes.api';

export {
  fetchCategoriesAdmin,
  createCategory,
  updateCategory,
  uploadCategoryImage,
  deleteCategory,
  bulkDeleteCategories,
  translateCategory,
  bulkTranslateCategories,
} from './categories.api';

export {
  fetchMenuItemsAdmin,
  createMenuItem,
  updateMenuItem,
  uploadMenuItemImage,
  deleteMenuItem,
  bulkUpdateMenuItems,
  bulkDeleteMenuItems,
  translateMenuItem,
  bulkTranslateMenuItems,
  type MenuItemsListParams,
  type MenuItemsListResponse,
} from './menuItems.api';

export { fetchLanguagesAdmin, createLanguage, updateLanguage, deleteLanguage } from './languages.api';

export {
  fetchSiteSettings,
  fetchSiteSettingsAdmin,
  updateSiteSettings,
  uploadLogo,
  type SiteSettingsDto,
} from './siteSettings.api';

export { fetchUsersAdmin, createUserAdmin, updateUserAdmin, deleteUserAdmin } from './users.api';

export { fetchBookingsAdmin, updateBookingStatusAdmin, type BookingAdminRow } from './bookings.api';
