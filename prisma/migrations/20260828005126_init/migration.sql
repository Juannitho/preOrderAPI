-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('MANAGER', 'STAFF');

-- CreateEnum
CREATE TYPE "preorder_status" AS ENUM ('DRAFT', 'OPEN', 'PAID', 'ORDERED', 'DELIVERED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "restaurants" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "timezone" VARCHAR(60) NOT NULL DEFAULT 'Australia/Melbourne',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'MANAGER',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_categories" (
    "id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "menu_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "ingredients" TEXT,
    "price_cents" INTEGER NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "created_by_id" UUID NOT NULL,
    "customer_name" VARCHAR(120) NOT NULL,
    "customer_email" VARCHAR(255),
    "customer_phone" VARCHAR(30),
    "booking_datetime" TIMESTAMPTZ(6) NOT NULL,
    "party_size" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preorders" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "access_code" VARCHAR(64) NOT NULL,
    "status" "preorder_status" NOT NULL DEFAULT 'DRAFT',
    "currency" CHAR(3) NOT NULL DEFAULT 'AUD',
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "preorders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL,
    "preorder_id" UUID NOT NULL,
    "menu_item_id" UUID NOT NULL,
    "item_name" VARCHAR(120) NOT NULL,
    "unit_price_cents" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "preorder_id" UUID NOT NULL,
    "stripe_payment_intent_id" VARCHAR(255) NOT NULL,
    "stripe_event_id" VARCHAR(255),
    "amount_cents" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'AUD',
    "status" "payment_status" NOT NULL DEFAULT 'PENDING',
    "failure_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_restaurant_id_idx" ON "users"("restaurant_id");

-- CreateIndex
CREATE INDEX "menu_categories_restaurant_id_idx" ON "menu_categories"("restaurant_id");

-- CreateIndex
CREATE UNIQUE INDEX "menu_categories_restaurant_id_name_key" ON "menu_categories"("restaurant_id", "name");

-- CreateIndex
CREATE INDEX "menu_items_category_id_idx" ON "menu_items"("category_id");

-- CreateIndex
CREATE INDEX "bookings_restaurant_id_booking_datetime_idx" ON "bookings"("restaurant_id", "booking_datetime");

-- CreateIndex
CREATE UNIQUE INDEX "preorders_booking_id_key" ON "preorders"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "preorders_access_code_key" ON "preorders"("access_code");

-- CreateIndex
CREATE INDEX "preorders_status_idx" ON "preorders"("status");

-- CreateIndex
CREATE INDEX "order_items_preorder_id_idx" ON "order_items"("preorder_id");

-- CreateIndex
CREATE INDEX "order_items_menu_item_id_idx" ON "order_items"("menu_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripe_payment_intent_id_key" ON "payments"("stripe_payment_intent_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripe_event_id_key" ON "payments"("stripe_event_id");

-- CreateIndex
CREATE INDEX "payments_preorder_id_idx" ON "payments"("preorder_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_categories" ADD CONSTRAINT "menu_categories_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "menu_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preorders" ADD CONSTRAINT "preorders_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_preorder_id_fkey" FOREIGN KEY ("preorder_id") REFERENCES "preorders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_preorder_id_fkey" FOREIGN KEY ("preorder_id") REFERENCES "preorders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
