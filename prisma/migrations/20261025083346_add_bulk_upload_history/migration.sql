-- CreateEnum
CREATE TYPE "BulkUploadStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED');

-- CreateTable
CREATE TABLE "BulkUpload" (
    "id" TEXT NOT NULL,
    "sellerProfileId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "importedRows" INTEGER NOT NULL DEFAULT 0,
    "failedRows" INTEGER NOT NULL DEFAULT 0,
    "status" "BulkUploadStatus" NOT NULL DEFAULT 'PROCESSING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkUploadRow" (
    "id" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "sku" TEXT,
    "productName" TEXT,
    "imported" BOOLEAN NOT NULL DEFAULT false,
    "errors" JSONB NOT NULL DEFAULT '[]',
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BulkUploadRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BulkUpload_sellerProfileId_createdAt_idx" ON "BulkUpload"("sellerProfileId", "createdAt");

-- CreateIndex
CREATE INDEX "BulkUpload_status_idx" ON "BulkUpload"("status");

-- CreateIndex
CREATE INDEX "BulkUploadRow_uploadId_rowNumber_idx" ON "BulkUploadRow"("uploadId", "rowNumber");

-- CreateIndex
CREATE INDEX "BulkUploadRow_sku_idx" ON "BulkUploadRow"("sku");

-- AddForeignKey
ALTER TABLE "BulkUpload" ADD CONSTRAINT "BulkUpload_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkUploadRow" ADD CONSTRAINT "BulkUploadRow_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "BulkUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE;
