-- Drop translation indexes that are no longer in the schema
DROP INDEX IF EXISTS "CategoryTranslation_categoryId_idx";
DROP INDEX IF EXISTS "CategoryTranslation_locale_idx";
DROP INDEX IF EXISTS "MenuTypeTranslation_menuTypeId_idx";
DROP INDEX IF EXISTS "MenuTypeTranslation_locale_idx";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'PLATFORM_OWNER');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'STARTER', 'PRO');

-- CreateEnum
CREATE TYPE "DepartmentType" AS ENUM ('KITCHEN', 'BAR', 'DELIVERY');

-- AlterTable: add role to User
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

-- AlterTable: add departmentsSent to Booking
ALTER TABLE "Booking" ADD COLUMN "departmentsSent" TEXT;

-- CreateTable: Department
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" "DepartmentType" NOT NULL,
    "telegramChatId" VARCHAR(64),
    "printerIp" VARCHAR(45),
    "printerPort" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Department_restaurantId_idx" ON "Department"("restaurantId");
CREATE UNIQUE INDEX "Department_restaurantId_type_key" ON "Department"("restaurantId", "type");

ALTER TABLE "Department" ADD CONSTRAINT "Department_restaurantId_fkey"
    FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: Subscription
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "trialEndsAt" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "stripeSubId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Subscription_restaurantId_key" ON "Subscription"("restaurantId");

ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_restaurantId_fkey"
    FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
