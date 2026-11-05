-- AlterTable
ALTER TABLE "SellerProfile" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "SellerProfile_status_idx" ON "SellerProfile"("status");

-- CreateIndex
CREATE INDEX "SellerProfile_pincode_status_idx" ON "SellerProfile"("pincode", "status");

-- CreateIndex
CREATE INDEX "SellerProfile_latitude_longitude_idx" ON "SellerProfile"("latitude", "longitude");
