
src/modules/
├── auth/
│   ├── auth.constants.js
│   ├── auth.repository.js
│   ├── auth.service.js
│   ├── auth.validation.js
│   └── otp.service.js
│
├── customer/
│   ├── customer.repository.js
│   └── customer.service.js
│
├── seller/
│   ├── seller-auth.service.js
│   ├── seller.repository.js
│   ├── seller.service.js
│   └── seller.validation.js
│
├── delivery/
│   ├── delivery-auth.service.js
│   ├── delivery.repository.js
│   ├── delivery.service.js
│   └── delivery.validation.js
│
└── admin/
    ├── admin-auth.service.js
    ├── admin.repository.js
    ├── admin.validation.js
    ├── admin-seller.repository.js
    └── admin-seller.service.js



src/
├── app/
│   ├── seller/
│   │   ├── layout.js
│   │   ├── dashboard/
│   │   │   └── page.js
│   │   ├── products/
│   │   │   ├── page.js
│   │   │   ├── new/
│   │   │   │   └── page.js
│   │   │   └── [productId]/
│   │   │       └── edit/
│   │   │           └── page.js
│   │   ├── inventory/
│   │   │   └── page.js
│   │   ├── bulk-upload/
│   │   │   └── page.js
│   │   ├── orders/
│   │   │   ├── page.js
│   │   │   └── [orderId]/
│   │   │       └── page.js
│   │   ├── dispatch/
│   │   │   └── page.js
│   │   ├── earnings/
│   │   │   └── page.js
│   │   ├── reports/
│   │   │   └── page.js
│   │   ├── settings/
│   │   │   └── page.js
│   │   ├── notifications/
│   │   │   └── page.js
│   │   └── support/
│   │       └── page.js
│   │
│   └── api/
│       └── v1/
│           └── seller/
│               ├── status/
│               │   └── route.js
│               ├── dashboard/
│               │   └── route.js
│               ├── products/
│               │   ├── route.js
│               │   └── [productId]/
│               │       └── route.js
│               ├── inventory/
│               │   └── route.js
│               ├── bulk-upload/
│               │   └── route.js
│               ├── orders/
│               │   ├── route.js
│               │   └── [orderId]/
│               │       └── route.js
│               ├── dispatch/
│               │   └── route.js
│               ├── earnings/
│               │   └── route.js
│               └── settings/
│                   └── route.js
│
├── components/
│   └── seller/
│       ├── SellerSidebar.jsx
│       ├── SellerHeader.jsx
│       ├── SellerStatCard.jsx
│       ├── SellerStatusBadge.jsx
│       ├── ProductForm.jsx
│       ├── ProductTable.jsx
│       ├── InventoryTable.jsx
│       └── OrderTable.jsx
│
├── modules/
│   └── seller/
│       ├── seller.repository.js
│       ├── seller.service.js
│       ├── seller.validation.js
│       ├── product.repository.js
│       ├── product.service.js
│       ├── product.validation.js
│       ├── inventory.repository.js
│       ├── inventory.service.js
│       ├── order.repository.js
│       ├── order.service.js
│       ├── dashboard.service.js
│       └── earnings.service.js
│
└── lib/
    ├── prisma.js
    ├── auth.js
    └── require-seller.js4


    1. CSV Product Import

Complete — products successfully import ho rahe hain.



2. Upload History

Seller apne previous uploads dekh sake, imported/failed rows aur upload date check kar sake, aur purani reports download kar sake.



3. Security & Data Validation

Duplicate SKU protection, category validation, seller authorization aur stock consistency verify karna.



4. Downloadable Import Reports

Har failed row ka reason aur successful import ka summary download karna.