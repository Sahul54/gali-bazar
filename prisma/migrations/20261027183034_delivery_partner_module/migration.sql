/*
  Warnings:

  - The `vehicleType` column on the `DeliveryPartnerProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('BIKE', 'SCOOTER', 'MOTORCYCLE', 'BICYCLE', 'THREE_WHEELER', 'OTHER');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERY_FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliveryAssignmentStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED', 'COMPLETED');

-- AlterTable
ALTER TABLE "DeliveryPartnerProfile" ADD COLUMN     "isOnline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLocationAt" TIMESTAMP(3),
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "licenseNumber" TEXT,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "maxDeliveryRadiusKm" DOUBLE PRECISION NOT NULL DEFAULT 5,
ADD COLUMN     "vehicleModel" TEXT,
ADD COLUMN     "vehicleNumber" TEXT,
DROP COLUMN "vehicleType",
ADD COLUMN     "vehicleType" "VehicleType";

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PLACED',
    "customerId" TEXT NOT NULL,
    "pickupAddress" TEXT,
    "pickupLatitude" DOUBLE PRECISION,
    "pickupLongitude" DOUBLE PRECISION,
    "deliveryAddress" TEXT NOT NULL,
    "deliveryLatitude" DOUBLE PRECISION,
    "deliveryLongitude" DOUBLE PRECISION,
    "assignedDeliveryPartnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryAssignment" (
    "id" TEXT NOT NULL,
    "status" "DeliveryAssignmentStatus" NOT NULL DEFAULT 'PENDING',
    "distanceKm" DOUBLE PRECISION,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "offeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" TEXT NOT NULL,
    "deliveryPartnerProfileId" TEXT NOT NULL,

    CONSTRAINT "DeliveryAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Order_assignedDeliveryPartnerId_status_idx" ON "Order"("assignedDeliveryPartnerId", "status");

-- CreateIndex
CREATE INDEX "Order_pickupLatitude_pickupLongitude_idx" ON "Order"("pickupLatitude", "pickupLongitude");

-- CreateIndex
CREATE INDEX "DeliveryAssignment_orderId_status_idx" ON "DeliveryAssignment"("orderId", "status");

-- CreateIndex
CREATE INDEX "DeliveryAssignment_deliveryPartnerProfileId_status_idx" ON "DeliveryAssignment"("deliveryPartnerProfileId", "status");

-- CreateIndex
CREATE INDEX "DeliveryAssignment_status_expiresAt_idx" ON "DeliveryAssignment"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "DeliveryPartnerProfile_status_isOnline_idx" ON "DeliveryPartnerProfile"("status", "isOnline");

-- CreateIndex
CREATE INDEX "DeliveryPartnerProfile_latitude_longitude_idx" ON "DeliveryPartnerProfile"("latitude", "longitude");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_assignedDeliveryPartnerId_fkey" FOREIGN KEY ("assignedDeliveryPartnerId") REFERENCES "DeliveryPartnerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryAssignment" ADD CONSTRAINT "DeliveryAssignment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryAssignment" ADD CONSTRAINT "DeliveryAssignment_deliveryPartnerProfileId_fkey" FOREIGN KEY ("deliveryPartnerProfileId") REFERENCES "DeliveryPartnerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
