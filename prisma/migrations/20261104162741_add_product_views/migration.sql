-- CreateTable
CREATE TABLE "ProductView" (
    "id" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "sessionId" TEXT,
    "productId" TEXT NOT NULL,

    CONSTRAINT "ProductView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductView_productId_viewedAt_idx" ON "ProductView"("productId", "viewedAt");

-- CreateIndex
CREATE INDEX "ProductView_userId_viewedAt_idx" ON "ProductView"("userId", "viewedAt");

-- CreateIndex
CREATE INDEX "ProductView_sessionId_viewedAt_idx" ON "ProductView"("sessionId", "viewedAt");

-- AddForeignKey
ALTER TABLE "ProductView" ADD CONSTRAINT "ProductView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductView" ADD CONSTRAINT "ProductView_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
