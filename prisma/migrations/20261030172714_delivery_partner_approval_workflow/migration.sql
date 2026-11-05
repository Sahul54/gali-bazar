-- AlterTable
ALTER TABLE "DeliveryPartnerProfile" ADD COLUMN     "licenseDocumentUrl" TEXT,
ADD COLUMN     "reapplyCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" TEXT,
ADD COLUMN     "vehicleDocumentUrl" TEXT;

-- CreateTable
CREATE TABLE "DeliveryPartnerApplicationHistory" (
    "id" TEXT NOT NULL,
    "previousStatus" "ApplicationStatus",
    "newStatus" "ApplicationStatus" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryPartnerProfileId" TEXT NOT NULL,
    "reviewedById" TEXT,

    CONSTRAINT "DeliveryPartnerApplicationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeliveryPartnerApplicationHistory_deliveryPartnerProfileId__idx" ON "DeliveryPartnerApplicationHistory"("deliveryPartnerProfileId", "createdAt");

-- CreateIndex
CREATE INDEX "DeliveryPartnerApplicationHistory_reviewedById_createdAt_idx" ON "DeliveryPartnerApplicationHistory"("reviewedById", "createdAt");

-- CreateIndex
CREATE INDEX "DeliveryPartnerApplicationHistory_newStatus_createdAt_idx" ON "DeliveryPartnerApplicationHistory"("newStatus", "createdAt");

-- CreateIndex
CREATE INDEX "DeliveryPartnerProfile_reviewedById_idx" ON "DeliveryPartnerProfile"("reviewedById");

-- AddForeignKey
ALTER TABLE "DeliveryPartnerProfile" ADD CONSTRAINT "DeliveryPartnerProfile_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryPartnerApplicationHistory" ADD CONSTRAINT "DeliveryPartnerApplicationHistory_deliveryPartnerProfileId_fkey" FOREIGN KEY ("deliveryPartnerProfileId") REFERENCES "DeliveryPartnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryPartnerApplicationHistory" ADD CONSTRAINT "DeliveryPartnerApplicationHistory_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
