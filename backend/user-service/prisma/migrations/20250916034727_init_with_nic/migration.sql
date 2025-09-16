-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'INVENTORY_MANAGER', 'SALES_STAFF', 'RESOURCE_MANAGER');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."OrderType" AS ENUM ('PURCHASE', 'SALE', 'RETURN', 'TRANSFER');

-- CreateEnum
CREATE TYPE "public"."VehicleType" AS ENUM ('TRUCK', 'VAN', 'CAR', 'MOTORCYCLE');

-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('READ', 'UNREAD', 'ARCHIVED');

-- CreateTable
CREATE TABLE "public"."user" (
    "userID" VARCHAR(50) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "public"."Role" NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "pic_url" VARCHAR(255),
    "pic" VARCHAR(255),
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "branch" VARCHAR(100) NOT NULL,
    "nic" VARCHAR(20),
    "date_of_employment" DATE NOT NULL,
    "performance_rating" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "public"."supplier" (
    "supplier_id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "contact_no" VARCHAR(20) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "address" VARCHAR(255) NOT NULL,

    CONSTRAINT "supplier_pkey" PRIMARY KEY ("supplier_id")
);

-- CreateTable
CREATE TABLE "public"."supplier_orders" (
    "supplier_order_id" VARCHAR(50) NOT NULL,
    "supplier_id" VARCHAR(50) NOT NULL,
    "order_status" "public"."OrderStatus" NOT NULL,
    "order_type" "public"."OrderType" NOT NULL,
    "product_id" VARCHAR(50) NOT NULL,
    "inventory_manager_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "supplier_orders_pkey" PRIMARY KEY ("supplier_order_id")
);

-- CreateTable
CREATE TABLE "public"."inventory_manager" (
    "inventory_manager_id" VARCHAR(50) NOT NULL,
    "userID" VARCHAR(50) NOT NULL,
    "branch" VARCHAR(100) NOT NULL,
    "date_of_employment" DATE NOT NULL,
    "performance_rating" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "inventory_manager_pkey" PRIMARY KEY ("inventory_manager_id")
);

-- CreateTable
CREATE TABLE "public"."product_category" (
    "category_id" VARCHAR(50) NOT NULL,
    "category_name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "product_category_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "public"."product" (
    "product_id" VARCHAR(50) NOT NULL,
    "category_id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "cost_price" DOUBLE PRECISION NOT NULL,
    "selling_price" DOUBLE PRECISION NOT NULL,
    "min_stock_level" INTEGER NOT NULL,
    "max_stock_level" INTEGER NOT NULL,
    "reorder_point" INTEGER NOT NULL,
    "shelf_life" INTEGER NOT NULL,
    "inventory_manager_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "public"."inventory" (
    "product_id" VARCHAR(50) NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "public"."customer" (
    "customer_id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "contact_no" VARCHAR(20) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "address" VARCHAR(255) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "public"."customer_orders" (
    "order_id" VARCHAR(50) NOT NULL,
    "customer_id" VARCHAR(50) NOT NULL,
    "order_status" "public"."OrderStatus" NOT NULL,
    "order_type" "public"."OrderType" NOT NULL,
    "sales_staff_id" VARCHAR(50) NOT NULL,
    "product_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "customer_orders_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "public"."stock_movements" (
    "order_id" VARCHAR(50) NOT NULL,
    "vehicle_id" VARCHAR(50) NOT NULL,
    "driver_name" VARCHAR(100) NOT NULL,
    "driver_phone_no" VARCHAR(20) NOT NULL,
    "resource_manager_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "public"."resource" (
    "vehicle_id" VARCHAR(50) NOT NULL,
    "plate_number" VARCHAR(20) NOT NULL,
    "type" "public"."VehicleType" NOT NULL,

    CONSTRAINT "resource_pkey" PRIMARY KEY ("vehicle_id")
);

-- CreateTable
CREATE TABLE "public"."resource_manager" (
    "userID" VARCHAR(50) NOT NULL,
    "resource_manager_id" VARCHAR(50) NOT NULL,
    "branch" VARCHAR(100) NOT NULL,
    "date_of_employment" DATE NOT NULL,
    "performance_rating" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "resource_manager_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "public"."admin" (
    "userID" VARCHAR(50) NOT NULL,
    "admin_id" VARCHAR(50) NOT NULL,
    "branch" VARCHAR(100) NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "public"."sales_staff" (
    "sales_staff_id" VARCHAR(50) NOT NULL,
    "userID" VARCHAR(50) NOT NULL,
    "performance_rating" DOUBLE PRECISION NOT NULL,
    "date_of_employment" DATE NOT NULL,

    CONSTRAINT "sales_staff_pkey" PRIMARY KEY ("sales_staff_id")
);

-- CreateTable
CREATE TABLE "public"."notification" (
    "userID" VARCHAR(50) NOT NULL,
    "message" VARCHAR(255) NOT NULL,
    "status" "public"."NotificationStatus" NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("userID","message")
);

-- CreateIndex
CREATE UNIQUE INDEX "resource_manager_userID_key" ON "public"."resource_manager"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "admin_userID_key" ON "public"."admin"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "sales_staff_userID_key" ON "public"."sales_staff"("userID");

-- AddForeignKey
ALTER TABLE "public"."supplier_orders" ADD CONSTRAINT "supplier_orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier"("supplier_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."supplier_orders" ADD CONSTRAINT "supplier_orders_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."supplier_orders" ADD CONSTRAINT "supplier_orders_inventory_manager_id_fkey" FOREIGN KEY ("inventory_manager_id") REFERENCES "public"."inventory_manager"("inventory_manager_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_manager" ADD CONSTRAINT "inventory_manager_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."user"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product" ADD CONSTRAINT "product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."product_category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product" ADD CONSTRAINT "product_inventory_manager_id_fkey" FOREIGN KEY ("inventory_manager_id") REFERENCES "public"."inventory_manager"("inventory_manager_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory" ADD CONSTRAINT "inventory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_orders" ADD CONSTRAINT "customer_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_orders" ADD CONSTRAINT "customer_orders_sales_staff_id_fkey" FOREIGN KEY ("sales_staff_id") REFERENCES "public"."user"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_orders" ADD CONSTRAINT "customer_orders_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_movements" ADD CONSTRAINT "stock_movements_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."resource"("vehicle_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_movements" ADD CONSTRAINT "stock_movements_resource_manager_id_fkey" FOREIGN KEY ("resource_manager_id") REFERENCES "public"."user"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_manager" ADD CONSTRAINT "resource_manager_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."user"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin" ADD CONSTRAINT "admin_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."user"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales_staff" ADD CONSTRAINT "sales_staff_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."user"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification" ADD CONSTRAINT "notification_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."user"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;
