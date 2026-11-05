-- CreateEnum
CREATE TYPE "DeliveryType" AS ENUM ('EXPRESS', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "DeliveryBatchStatus" AS ENUM ('PENDING', 'OFFERED', 'ACCEPTED', 'PICKING_UP', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- DropIndex
DROP INDEX "User_role_idx";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryBatchId" TEXT,
ADD COLUMN     "deliveryType" "DeliveryType" NOT NULL DEFAULT 'EXPRESS',
ADD COLUMN     "scheduledDate" TIMESTAMP(3),
ADD COLUMN     "scheduledSlot" TEXT;

-- CreateTable
CREATE TABLE "DeliveryBatch" (
    "id" TEXT NOT NULL,
    "status" "DeliveryBatchStatus" NOT NULL DEFAULT 'PENDING',
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalEarning" DECIMAL(10,2),
    "totalDistanceKm" DOUBLE PRECISION,
    "offeredAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "partnerProfileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeliveryBatch_partnerProfileId_status_idx" ON "DeliveryBatch"("partnerProfileId", "status");

-- CreateIndex
CREATE INDEX "DeliveryBatch_status_expiresAt_idx" ON "DeliveryBatch"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "Order_deliveryType_status_scheduledDate_idx" ON "Order"("deliveryType", "status", "scheduledDate");

-- CreateIndex
CREATE INDEX "Order_deliveryBatchId_idx" ON "Order"("deliveryBatchId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryBatchId_fkey" FOREIGN KEY ("deliveryBatchId") REFERENCES "DeliveryBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryBatch" ADD CONSTRAINT "DeliveryBatch_partnerProfileId_fkey" FOREIGN KEY ("partnerProfileId") REFERENCES "DeliveryPartnerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
