-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('COD');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "checkoutGroupId" TEXT,
ADD COLUMN     "deliveryLandmark" TEXT,
ADD COLUMN     "deliveryName" TEXT,
ADD COLUMN     "deliveryPhone" TEXT,
ADD COLUMN     "deliveryPincode" TEXT,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'COD',
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "sellerProfileId" TEXT;

-- CreateIndex
CREATE INDEX "Order_sellerProfileId_status_createdAt_idx" ON "Order"("sellerProfileId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Order_checkoutGroupId_idx" ON "Order"("checkoutGroupId");

-- CreateIndex
CREATE INDEX "Order_customerId_createdAt_idx" ON "Order"("customerId", "createdAt");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "SellerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
