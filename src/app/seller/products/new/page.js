"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  PackagePlus,
  ImagePlus,
  Boxes,
  IndianRupee,
  Barcode,
  FileText,
  Layers3,
  Save,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

const initialForm = {
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
  quantity: "0",
  lowStockThreshold: "10",
  variantTitle: "",
  weightGrams: "",
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100";

function flattenCategories(categories, level = 0) {
  if (!Array.isArray(categories)) return [];

  return categories.flatMap((category) => [
    {
      id: category.id,
      name: category.name,
      level,
    },
    ...flattenCategories(category.children || [], level + 1),
  ]);
}

export default function NewProductPage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  async function loadCategories() {
    setCategoriesLoading(true);
    setCategoriesError("");

    try {
      const response = await fetch("/api/v1/seller/categories", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load categories."
        );
      }

      setCategories(data.categories || []);
    } catch (error) {
      setCategoriesError(
        error.message || "Unable to load categories."
      );
    } finally {
      setCategoriesLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (saving) return;

    if (!form.name.trim()) {
      setMessageType("error");
      setMessage("Product name is required.");
      return;
    }

    if (!form.categoryId) {
      setMessageType("error");
      setMessage("Please select a category.");
      return;
    }

    if (!form.sku.trim()) {
      setMessageType("error");
      setMessage("SKU is required.");
      return;
    }

    if (
      form.price === "" ||
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) <= 0
    ) {
      setMessageType("error");
      setMessage("Enter a valid selling price greater than zero.");
      return;
    }

    if (
      form.compareAtPrice !== "" &&
      (!Number.isFinite(Number(form.compareAtPrice)) ||
        Number(form.compareAtPrice) < 0)
    ) {
      setMessageType("error");
      setMessage("Enter a valid MRP.");
      return;
    }

    if (
      form.costPrice !== "" &&
      (!Number.isFinite(Number(form.costPrice)) ||
        Number(form.costPrice) < 0)
    ) {
      setMessageType("error");
      setMessage("Enter a valid cost price.");
      return;
    }

    if (
      !Number.isSafeInteger(Number(form.quantity)) ||
      Number(form.quantity) < 0
    ) {
      setMessageType("error");
      setMessage("Opening quantity must be a non-negative whole number.");
      return;
    }

    if (
      !Number.isSafeInteger(Number(form.lowStockThreshold)) ||
      Number(form.lowStockThreshold) < 0
    ) {
      setMessageType("error");
      setMessage("Low-stock threshold must be a non-negative whole number.");
      return;
    }

    if (
      form.weightGrams !== "" &&
      (!Number.isSafeInteger(Number(form.weightGrams)) ||
        Number(form.weightGrams) < 1)
    ) {
      setMessageType("error");
      setMessage("Weight must be a positive whole number of grams.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/v1/seller/products", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          description: form.description.trim(),
          brand: form.brand.trim(),
          sku: form.sku.trim(),
          barcode: form.barcode.trim(),
          variantTitle: form.variantTitle.trim(),
          imageUrl: form.imageUrl.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to save product."
        );
      }

      setMessageType("success");
      setMessage(
        "Product created successfully! Redirecting to your products..."
      );

      window.setTimeout(() => {
        router.push("/seller/products");
        router.refresh();
      }, 1000);
    } catch (error) {
      setMessageType("error");
      setMessage(
        error.message || "Something went wrong while saving the product."
      );
    } finally {
      setSaving(false);
    }
  }

  const flattenedCategories = flattenCategories(categories);

  return (
    <div className="min-h-screen bg-gray-50/70 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href="/seller/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft size={17} />
          Back to Products
        </Link>

        <div>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-950 text-white">
            <PackagePlus size={23} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
            Add New Product
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Add product information, pricing and opening inventory.
          </p>
        </div>

        {message && (
          <div
            role={messageType === "error" ? "alert" : "status"}
            className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
              messageType === "error"
                ? "border-red-200 bg-red-50 text-red-900"
                : "border-emerald-200 bg-emerald-50 text-emerald-900"
            }`}
          >
            {messageType === "error" ? (
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            )}

            <p>{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section
            icon={FileText}
            title="Basic Information"
            description="Add the main details customers will see."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Product Name" required>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Premium Cotton T-Shirt"
                  className={inputClass}
                  maxLength={160}
                  required
                  disabled={saving}
                />
              </Field>

              <Field label="Brand">
                <input
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="Enter brand name"
                  className={inputClass}
                  maxLength={100}
                  disabled={saving}
                />
              </Field>

              <Field label="Category" required>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  disabled={saving || categoriesLoading}
                >
                  <option value="">
                    {categoriesLoading
                      ? "Loading categories..."
                      : categoriesError
                        ? "Unable to load categories"
                        : flattenedCategories.length
                          ? "Select a category"
                          : "No categories available"}
                  </option>

                  {flattenedCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {"— ".repeat(category.level)}
                      {category.name}
                    </option>
                  ))}
                </select>

                {categoriesError ? (
                  <div className="mt-2">
                    <p className="text-xs text-red-600">
                      {categoriesError}
                    </p>

                    <button
                      type="button"
                      onClick={loadCategories}
                      disabled={categoriesLoading || saving}
                      className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-black disabled:opacity-50"
                    >
                      <RefreshCw size={13} />
                      Retry loading categories
                    </button>
                  </div>
                ) : (
                  <p className="mt-1.5 text-xs text-gray-400">
                    {categoriesLoading
                      ? "Fetching categories from the database."
                      : `${flattenedCategories.length} categories available.`}
                  </p>
                )}
              </Field>

              <Field label="Variant Name">
                <input
                  name="variantTitle"
                  value={form.variantTitle}
                  onChange={handleChange}
                  placeholder="e.g. Blue / Large"
                  className={inputClass}
                  maxLength={100}
                  disabled={saving}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Description">
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe the product, its features and specifications..."
                    rows={4}
                    maxLength={5000}
                    className={`${inputClass} resize-y`}
                    disabled={saving}
                  />
                </Field>
              </div>
            </div>
          </Section>

          <Section
            icon={ImagePlus}
            title="Product Image"
            description="Add a publicly accessible image URL for now."
          >
            <Field label="Image URL">
              <input
                name="imageUrl"
                type="url"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/product-image.jpg"
                className={inputClass}
                disabled={saving}
              />
            </Field>

            <p className="mt-2 text-xs text-gray-400">
              File upload and image storage will be implemented separately.
            </p>
          </Section>

          <Section
            icon={Barcode}
            title="SKU & Identification"
            description="Use a unique SKU to identify each variant."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="SKU" required>
                <input
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="e.g. GB-TSHIRT-001"
                  className={inputClass}
                  maxLength={100}
                  required
                  disabled={saving}
                />
              </Field>

              <Field label="Barcode">
                <input
                  name="barcode"
                  value={form.barcode}
                  onChange={handleChange}
                  placeholder="Enter barcode (optional)"
                  className={inputClass}
                  maxLength={100}
                  disabled={saving}
                />
              </Field>

              <Field label="Weight (grams)">
                <input
                  name="weightGrams"
                  type="number"
                  min="1"
                  step="1"
                  value={form.weightGrams}
                  onChange={handleChange}
                  placeholder="e.g. 500"
                  className={inputClass}
                  disabled={saving}
                />
              </Field>
            </div>
          </Section>

          <Section
            icon={IndianRupee}
            title="Pricing"
            description="Enter selling price and optional reference prices."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Field label="Selling Price (₹)" required>
                <input
                  name="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="499.00"
                  className={inputClass}
                  required
                  disabled={saving}
                />
              </Field>

              <Field label="MRP / Compare-at Price (₹)">
                <input
                  name="compareAtPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.compareAtPrice}
                  onChange={handleChange}
                  placeholder="699.00"
                  className={inputClass}
                  disabled={saving}
                />
              </Field>

              <Field label="Cost Price (₹)">
                <input
                  name="costPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.costPrice}
                  onChange={handleChange}
                  placeholder="300.00"
                  className={inputClass}
                  disabled={saving}
                />
              </Field>
            </div>
          </Section>

          <Section
            icon={Boxes}
            title="Inventory"
            description="Set the opening stock and low-stock alert threshold."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Opening Quantity" required>
                <input
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={form.quantity}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  disabled={saving}
                />
              </Field>

              <Field label="Low Stock Alert At">
                <input
                  name="lowStockThreshold"
                  type="number"
                  min="0"
                  step="1"
                  value={form.lowStockThreshold}
                  onChange={handleChange}
                  className={inputClass}
                  disabled={saving}
                />
              </Field>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
              <Layers3 size={19} className="mt-0.5 shrink-0" />
              <p className="leading-6">
                Opening stock will be associated with the product variant.
                The server records an OPENING_STOCK inventory movement when
                the product is created.
              </p>
            </div>
          </Section>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
            <Link
              href="/seller/products"
              aria-disabled={saving}
              className={`inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 ${
                saving ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={
                saving ||
                categoriesLoading ||
                Boolean(categoriesError) ||
                flattenedCategories.length === 0
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gray-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}

              {saving ? "Saving Product..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required = false, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {children}
    </div>
  );
}

function Section({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-start gap-3 border-b border-gray-100 pb-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
          <Icon size={20} />
        </div>

        <div>
          <h2 className="font-semibold text-gray-950">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>

      {children}
    </section>
  );
}
