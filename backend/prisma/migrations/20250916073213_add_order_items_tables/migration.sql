-- CreateTable
CREATE TABLE "public"."supplier_order_items" (
    "order_item_id" UUID NOT NULL,
    "order_id" VARCHAR(50) NOT NULL,
    "product_id" VARCHAR(50) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_order_items_pkey" PRIMARY KEY ("order_item_id")
);

-- CreateTable
CREATE TABLE "public"."customer_order_items" (
    "order_item_id" UUID NOT NULL,
    "order_id" VARCHAR(50) NOT NULL,
    "product_id" VARCHAR(50) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_order_items_pkey" PRIMARY KEY ("order_item_id")
);

-- AddForeignKey
ALTER TABLE "public"."supplier_order_items" ADD CONSTRAINT "supplier_order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."supplier_orders"("supplier_order_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."supplier_order_items" ADD CONSTRAINT "supplier_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_order_items" ADD CONSTRAINT "customer_order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."customer_orders"("order_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_order_items" ADD CONSTRAINT "customer_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;
