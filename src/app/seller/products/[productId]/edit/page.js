"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Package,
  Image as ImageIcon,
  IndianRupee,
  Boxes,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Tag,
  Barcode,
  FileText,
  Scale,
} from "lucide-react";

const INITIAL_FORM = {
  name: "",
  description: "",
  brand: "",
  categoryId: "",
  imageUrl: "",
  sku: "",
  barcode: "",
  price: "",
  compareAtPrice: "",
  costPrice: "",
  quantity: "",
  lowStockThreshold: "5",
  variantTitle: "Default",
  weightGrams: "",
};

function FieldLabel({ children, required = false }) {
  return (
    <label className="mb-2 block text-sm font-medium text-gray-700">
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  required = false,
  type = "text",
  placeholder = "",
  min,
  step,
  icon: Icon,
  disabled = false,
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          min={min}
          step={step}
          disabled={disabled}
          className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100 ${
            Icon ? "pl-10" : ""
          }`}
        />
      </div>
    </div>
  );
}

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-start gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
          <Icon size={20} />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
        {children}
      </div>
    </section>
  );
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.productId;

  const [form, setForm] = useState(INITIAL_FORM);
  const [categories, setCategories] = useState([]);
  const [productStatus, setProductStatus] = useState("DRAFT");
  const [reservedQuantity, setReservedQuantity] = useState(0);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [imageError, setImageError] = useState(false);

  const loadData = useCallback(async () => {
    if (!productId) return;

    setLoading(true);
    setPageError("");
    setSuccessMessage("");

    try {
      const [productResponse, categoryResponse] = await Promise.all([
        fetch(`/api/v1/seller/products/${productId}`, {
          method: "GET",
          cache: "no-store",
        }),
        fetch("/api/v1/seller/categories", {
          method: "GET",
          cache: "no-store",
        }),
      ]);

      const productResult = await productResponse.json().catch(() => ({}));
      const categoryResult = await categoryResponse.json().catch(() => ({}));

      if (!productResponse.ok) {
        throw new Error(
          productResult.message ||
            productResult.error ||
            "Product details load nahi ho paayi."
        );
      }

      if (!categoryResponse.ok) {
        throw new Error(
          categoryResult.message ||
            categoryResult.error ||
            "Categories load nahi ho paayi."
        );
      }

      const product =
        productResult.product ||
        productResult.data?.product ||
        productResult.data ||
        productResult;

      const categoryData =
        categoryResult.categories ||
        categoryResult.data?.categories ||
        categoryResult.data ||
        [];

      if (!product?.id) {
        throw new Error("API response mein product details nahi mili.");
      }

      const flatCategories = [];
      const flatten = (items, prefix = "") => {
        if (!Array.isArray(items)) return;

        items.forEach((category) => {
          const label = prefix
            ? `${prefix} / ${category.name}`
            : category.name;

          flatCategories.push({
            id: category.id,
            name: category.name,
            label,
          });

          flatten(category.children || [], label);
        });
      };

      flatten(categoryData);
      setCategories(flatCategories);

      const imageUrl =
        product.imageUrl ||
        product.image?.url ||
        product.images?.[0]?.url ||
        "";

      setCurrentImageUrl(imageUrl);
      setImageError(false);
      setProductStatus(product.status || "DRAFT");
      setReservedQuantity(Number(product.reservedQuantity || 0));

      setForm({
        name: product.name || "",
        description: product.description || "",
        brand: product.brand || "",
        categoryId: product.categoryId || product.category?.id || "",
        imageUrl,
        sku: product.sku || product.variants?.[0]?.sku || "",
        barcode: product.barcode || product.variants?.[0]?.barcode || "",
        price: String(product.price ?? product.variants?.[0]?.price ?? ""),
        compareAtPrice: String(
          product.compareAtPrice ??
            product.variants?.[0]?.compareAtPrice ??
            ""
        ),
        costPrice: String(
          product.costPrice ?? product.variants?.[0]?.costPrice ?? ""
        ),
        quantity: String(
          product.quantity ??
            product.variants?.[0]?.inventory?.quantity ??
            ""
        ),
        lowStockThreshold: String(
          product.lowStockThreshold ??
            product.variants?.[0]?.inventory?.lowStockThreshold ??
            5
        ),
        variantTitle:
          product.variantTitle || product.variants?.[0]?.title || "Default",
        weightGrams: String(
          product.weightGrams ?? product.variants?.[0]?.weightGrams ?? ""
        ),
      });
    } catch (error) {
      setPageError(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));

    if (name === "imageUrl") {
      setImageError(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPageError("");
    setSuccessMessage("");

    const price = Number(form.price);
    const compareAtPrice =
      form.compareAtPrice.trim() === ""
        ? null
        : Number(form.compareAtPrice);
    const costPrice =
      form.costPrice.trim() === "" ? null : Number(form.costPrice);
    const quantity = Number(form.quantity);
    const lowStockThreshold = Number(form.lowStockThreshold);
    const weightGrams =
      form.weightGrams.trim() === "" ? null : Number(form.weightGrams);

    if (!form.name.trim()) {
      setPageError("Product name required hai.");
      return;
    }

    if (!form.categoryId) {
      setPageError("Please category select karein.");
      return;
    }

    if (!form.sku.trim()) {
      setPageError("SKU required hai.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setPageError("Valid selling price enter karein.");
      return;
    }

    if (compareAtPrice !== null && compareAtPrice < price) {
      setPageError(
        "Compare-at price selling price se kam nahi honi chahiye."
      );
      return;
    }

    if (
      costPrice !== null &&
      (!Number.isFinite(costPrice) || costPrice < 0)
    ) {
      setPageError("Valid cost price enter karein.");
      return;
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 0 ||
      quantity < reservedQuantity
    ) {
      setPageError(
        `Stock kam se kam ${reservedQuantity} hona chahiye, kyunki itne items reserved hain.`
      );
      return;
    }

    if (
      !Number.isInteger(lowStockThreshold) ||
      lowStockThreshold < 0
    ) {
      setPageError("Low-stock threshold 0 ya usse zyada hona chahiye.");
      return;
    }

    if (
      weightGrams !== null &&
      (!Number.isFinite(weightGrams) || weightGrams < 0)
    ) {
      setPageError("Valid weight enter karein.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/v1/seller/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          brand: form.brand.trim(),
          categoryId: form.categoryId,
          imageUrl: form.imageUrl.trim(),
          sku: form.sku.trim(),
          barcode: form.barcode.trim(),
          price,
          compareAtPrice,
          costPrice,
          quantity,
          lowStockThreshold,
          variantTitle: form.variantTitle.trim() || "Default",
          weightGrams,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message ||
            result.error ||
            "Product update nahi ho paaya."
        );
      }

      setSuccessMessage(result.message || "Product successfully update ho gaya.");

      // Listing page par wapas jaane se pehle confirmation show karein.
      router.push("/seller/products");
      router.refresh();
    } catch (error) {
      setPageError(error.message || "Product update karte waqt error aaya.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <LoaderCircle className="mx-auto animate-spin text-orange-500" size={34} />
          <p className="mt-3 text-sm text-gray-500">Product details load ho rahi hain...</p>
        </div>
      </div>
    );
  }

  if (pageError && !form.name) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/seller/products"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-600"
          >
            <ArrowLeft size={17} />
            Back to Products
          </Link>

          <div className="rounded-2xl border border-red-200 bg-white p-6 sm:p-8">
            <AlertCircle className="mb-3 text-red-500" size={32} />
            <h1 className="text-xl font-bold text-gray-900">
              Product load nahi ho paaya
            </h1>
            <p className="mt-2 text-sm text-red-600">{pageError}</p>
            <button
              type="button"
              onClick={loadData}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link
            href="/seller/products"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-orange-600"
          >
            <ArrowLeft size={17} />
            Back to Products
          </Link>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  Edit Product
                </h1>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                  {productStatus}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Product details, pricing aur inventory update karein.
              </p>
            </div>

            <button
              type="button"
              onClick={loadData}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 sm:self-auto"
            >
              <RefreshCw size={16} />
              Reload
            </button>
          </div>
        </div>

        {pageError && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p>{pageError}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 size={19} />
            <p>{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <SectionCard
            icon={Package}
            title="Basic Information"
            description="Product ka naam aur main details"
          >
            <div className="sm:col-span-2">
              <InputField
                label="Product Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Premium Cotton T-Shirt"
              />
            </div>

            <InputField
              label="Brand"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              placeholder="Brand name"
              icon={Tag}
            />

            <div>
              <FieldLabel required>Category</FieldLabel>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="mt-2 text-xs text-amber-600">
                  Categories nahi mili. Seller categories API check karein.
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <FieldLabel>Description</FieldLabel>
              <div className="relative">
                <FileText
                  size={17}
                  className="absolute left-3 top-3.5 text-gray-400"
                />
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Product ke baare mein details..."
                  className="w-full resize-y rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={IndianRupee}
            title="Pricing"
            description="Selling price aur product cost"
          >
            <InputField
              label="Selling Price (₹)"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="499"
              icon={IndianRupee}
            />

            <InputField
              label="Compare-at Price (₹)"
              name="compareAtPrice"
              type="number"
              value={form.compareAtPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="699"
              icon={IndianRupee}
            />

            <InputField
              label="Cost Price (₹)"
              name="costPrice"
              type="number"
              value={form.costPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="300"
              icon={IndianRupee}
            />

            <InputField
              label="Variant Title"
              name="variantTitle"
              value={form.variantTitle}
              onChange={handleChange}
              placeholder="Default / Medium / Red"
            />
          </SectionCard>

          <SectionCard
            icon={Boxes}
            title="Inventory & SKU"
            description="Stock, SKU aur inventory settings"
          >
            <InputField
              label="SKU"
              name="sku"
              value={form.sku}
              onChange={handleChange}
              required
              placeholder="GB-TSHIRT-001"
              icon={Barcode}
            />

            <InputField
              label="Barcode"
              name="barcode"
              value={form.barcode}
              onChange={handleChange}
              placeholder="Optional barcode"
              icon={Barcode}
            />

            <InputField
              label="Available Stock Quantity"
              name="quantity"
              type="number"
              value={form.quantity}
              onChange={handleChange}
              required
              min={String(reservedQuantity)}
              step="1"
              placeholder="100"
              icon={Boxes}
            />

            <InputField
              label="Low Stock Alert Threshold"
              name="lowStockThreshold"
              type="number"
              value={form.lowStockThreshold}
              onChange={handleChange}
              required
              min="0"
              step="1"
              placeholder="5"
            />

            <div className="sm:col-span-2 rounded-xl border border-orange-100 bg-orange-50 p-4">
              <p className="text-sm font-semibold text-orange-900">
                Reserved stock: {reservedQuantity}
              </p>
              <p className="mt-1 text-xs leading-5 text-orange-800">
                Stock quantity reserved items se kam nahi ho sakti. Reserved
                stock ko alag se release karne ke liye inventory workflow use
                karna hoga.
              </p>
            </div>
          </SectionCard>

          <SectionCard
            icon={ImageIcon}
            title="Product Image"
            description="Image URL update karein"
          >
            <div className="sm:col-span-2">
              <FieldLabel>Image URL</FieldLabel>
              <input
                type="url"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/product-image.jpg"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
              <p className="mt-2 text-xs text-gray-500">
                Blank chhodne par existing image preserve hogi. Image change
                karne ke liye valid public image URL paste karein.
              </p>
            </div>

            {form.imageUrl && !imageError && (
              <div className="sm:col-span-2">
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Image Preview
                </p>
                <div className="flex min-h-40 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <img
                    src={form.imageUrl}
                    alt="Product preview"
                    className="max-h-64 max-w-full rounded-lg object-contain"
                    onError={() => setImageError(true)}
                  />
                </div>
              </div>
            )}

            {form.imageUrl && imageError && (
              <p className="sm:col-span-2 text-sm text-amber-600">
                Image preview load nahi hui. URL check karein; agar URL invalid
                hai to update karne se pehle sahi URL enter karein.
              </p>
            )}

            {!form.imageUrl && currentImageUrl && (
              <p className="sm:col-span-2 text-sm text-gray-500">
                Existing image URL blank karne se remove nahi hogi.
              </p>
            )}
          </SectionCard>

          <div className="sticky bottom-3 z-10 flex flex-col-reverse gap-3 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/seller/products"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
