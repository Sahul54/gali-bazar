-- CreateTable
CREATE TABLE "DeliveryZone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expressFee" DECIMAL(10,2) NOT NULL,
    "scheduledFee" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryZonePincode" (
    "id" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deliveryZoneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryZonePincode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryZone_code_key" ON "DeliveryZone"("code");

-- CreateIndex
CREATE INDEX "DeliveryZone_isActive_name_idx" ON "DeliveryZone"("isActive", "name");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryZonePincode_pincode_key" ON "DeliveryZonePincode"("pincode");

-- CreateIndex
CREATE INDEX "DeliveryZonePincode_deliveryZoneId_isActive_idx" ON "DeliveryZonePincode"("deliveryZoneId", "isActive");

-- AddForeignKey
ALTER TABLE "DeliveryZonePincode" ADD CONSTRAINT "DeliveryZonePincode_deliveryZoneId_fkey" FOREIGN KEY ("deliveryZoneId") REFERENCES "DeliveryZone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
