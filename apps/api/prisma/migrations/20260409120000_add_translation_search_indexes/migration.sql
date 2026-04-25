-- Add indexes for faster search on MenuItemTranslation
CREATE INDEX "MenuItemTranslation_menuItemId_idx" ON "MenuItemTranslation"("menuItemId");
CREATE INDEX "MenuItemTranslation_locale_idx" ON "MenuItemTranslation"("locale");

-- Add indexes for CategoryTranslation
CREATE INDEX "CategoryTranslation_categoryId_idx" ON "CategoryTranslation"("categoryId");
CREATE INDEX "CategoryTranslation_locale_idx" ON "CategoryTranslation"("locale");

-- Add indexes for MenuTypeTranslation
CREATE INDEX "MenuTypeTranslation_menuTypeId_idx" ON "MenuTypeTranslation"("menuTypeId");
CREATE INDEX "MenuTypeTranslation_locale_idx" ON "MenuTypeTranslation"("locale");
