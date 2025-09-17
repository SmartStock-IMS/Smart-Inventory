/*
  Warnings:

  - You are about to drop the column `name` on the `customer` table. All the data in the column will be lost.
  - Added the required column `first_name` to the `customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `customer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- AlterTable
ALTER TABLE "public"."customer" DROP COLUMN "name",
ADD COLUMN     "contact2" VARCHAR(20),
ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "first_name" VARCHAR(100) NOT NULL,
ADD COLUMN     "last_name" VARCHAR(100) NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "profile_pic" VARCHAR(255),
ADD COLUMN     "status" "public"."CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updated_at" TIMESTAMPTZ NOT NULL;
