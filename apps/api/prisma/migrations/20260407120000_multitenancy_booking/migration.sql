-- CreateEnum
CREATE TYPE "UserRestaurantRole" AS ENUM ('OWNER', 'EDITOR');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(80),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantDomain" (
    "id" TEXT NOT NULL,
    "host" VARCHAR(255) NOT NULL,
    "restaurantId" TEXT NOT NULL,

    CONSTRAINT "RestaurantDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRestaurant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "role" "UserRestaurantRole" NOT NULL DEFAULT 'EDITOR',

    CONSTRAINT "UserRestaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "orderNumber" VARCHAR(32) NOT NULL,
    "guestName" VARCHAR(200) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "email" VARCHAR(200),
    "scheduledAt" TIMESTAMP(3),
    "partySize" INTEGER NOT NULL DEFAULT 1,
    "comment" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "itemsJson" JSONB,
    "receiptText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- Default tenant data (existing single-tenant DB)
INSERT INTO "Restaurant" ("id", "name", "slug", "createdAt", "updatedAt")
VALUES ('cm_seed_restaurant', 'Ayvan', 'default', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "Menu" ("id", "restaurantId", "name", "sortOrder", "isActive", "createdAt", "updatedAt")
VALUES ('cm_seed_menu_default', 'cm_seed_restaurant', 'Основное меню', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "RestaurantDomain" ("id", "host", "restaurantId")
VALUES ('cm_seed_domain', 'localhost', 'cm_seed_restaurant');

-- AlterTable MenuType
ALTER TABLE "MenuType" DROP CONSTRAINT IF EXISTS "MenuType_code_key";
DROP INDEX IF EXISTS "MenuType_code_key";

ALTER TABLE "MenuType" ADD COLUMN     "menuId" TEXT,
ADD COLUMN     "imagePath" TEXT;

UPDATE "MenuType" SET "menuId" = 'cm_seed_menu_default' WHERE "menuId" IS NULL;

ALTER TABLE "MenuType" ALTER COLUMN "menuId" SET NOT NULL;

-- AlterTable Category
ALTER TABLE "Category" ADD COLUMN "imagePath" TEXT;

-- AlterTable SiteSettings: add restaurantId and telegram fields
ALTER TABLE "SiteSettings" ADD COLUMN "restaurantId" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "ownerTelegramChatId" VARCHAR(64);
ALTER TABLE "SiteSettings" ADD COLUMN "staffTelegramChatId" VARCHAR(64);

UPDATE "SiteSettings" SET "restaurantId" = 'cm_seed_restaurant' WHERE "restaurantId" IS NULL;

INSERT INTO "SiteSettings" ("id", "restaurantId", "updatedAt")
SELECT 'cm_seed_sitesettings', 'cm_seed_restaurant', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "SiteSettings");

ALTER TABLE "SiteSettings" ALTER COLUMN "restaurantId" SET NOT NULL;

-- Link all users to default restaurant as OWNER (data migration)
INSERT INTO "UserRestaurant" ("id", "userId", "restaurantId", "role")
SELECT
  'cm_seed_ur_' || "id",
  "id",
  'cm_seed_restaurant',
  'OWNER'::"UserRestaurantRole"
FROM "User";

CREATE UNIQUE INDEX "SiteSettings_restaurantId_key" ON "SiteSettings"("restaurantId");

CREATE UNIQUE INDEX "Restaurant_slug_key" ON "Restaurant"("slug");

CREATE UNIQUE INDEX "RestaurantDomain_host_key" ON "RestaurantDomain"("host");

CREATE UNIQUE INDEX "UserRestaurant_userId_restaurantId_key" ON "UserRestaurant"("userId", "restaurantId");

CREATE INDEX "UserRestaurant_restaurantId_idx" ON "UserRestaurant"("restaurantId");

CREATE INDEX "RestaurantDomain_restaurantId_idx" ON "RestaurantDomain"("restaurantId");

CREATE INDEX "Menu_restaurantId_idx" ON "Menu"("restaurantId");

CREATE UNIQUE INDEX "MenuType_menuId_code_key" ON "MenuType"("menuId", "code");

CREATE INDEX "Booking_restaurantId_createdAt_idx" ON "Booking"("restaurantId", "createdAt");

CREATE UNIQUE INDEX "Booking_restaurantId_orderNumber_key" ON "Booking"("restaurantId", "orderNumber");

-- AddForeignKey
ALTER TABLE "RestaurantDomain" ADD CONSTRAINT "RestaurantDomain_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRestaurant" ADD CONSTRAINT "UserRestaurant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRestaurant" ADD CONSTRAINT "UserRestaurant_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuType" ADD CONSTRAINT "MenuType_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
