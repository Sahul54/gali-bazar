
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Grid3X3,
  ArrowRight,
  ChevronRight,
  FolderOpen,
  X,
} from "lucide-react";

import useCategories from "@/hooks/customer/useCategories";

export default function CategoriesPage() {
  const { categories, loading, error } = useCategories();
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return categories || [];

    return (categories || [])
      .map((category) => {
        const matchesParent =
          category.name?.toLowerCase().includes(query);

        const matchingChildren = (category.children || []).filter(
          (child) =>
            child.name?.toLowerCase().includes(query)
        );

        if (matchesParent) return category;

        if (matchingChildren.length > 0) {
          return {
            ...category,
            children: matchingChildren,
          };
        }

        return null;
      })
      .filter(Boolean);
  }, [categories, search]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-green-700">
            Gali Bazar / Categories
          </p>

          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            Explore Categories
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Find products easily by browsing different categories.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-xl">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search categories..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-11 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5"
              >
                <div className="h-12 w-12 rounded-xl bg-gray-200" />
                <div className="mt-4 h-4 w-2/3 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Categories */}
        {!loading && !error && (
          <>
            {filteredCategories.length > 0 ? (
              <div className="space-y-10">
                {filteredCategories.map((category) => (
                  <section key={category.id}>
                    {/* Parent Category */}
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {category.name}
                        </h2>

                        {category.description && (
                          <p className="mt-1 text-sm text-gray-500">
                            {category.description}
                          </p>
                        )}
                      </div>

                      <Link
                        href={`/products?categoryId=${category.id}`}
                        className="hidden items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-800 sm:inline-flex"
                      >
                        View Products
                        <ArrowRight size={16} />
                      </Link>
                    </div>

                    {/* Parent Card */}
                    <Link
                      href={`/products?categoryId=${category.id}`}
                      className="mb-4 flex items-center gap-4 rounded-2xl border border-green-100 bg-green-50 p-5 transition hover:border-green-300"
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-green-700">
                        <Grid3X3 size={27} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900">
                          All {category.name}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          Explore all products in this category
                        </p>
                      </div>

                      <ChevronRight
                        size={21}
                        className="text-green-700"
                      />
                    </Link>

                    {/* Subcategories */}
                    {category.children?.length > 0 && (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {category.children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/products?categoryId=${child.id}`}
                            className="group rounded-2xl border border-gray-100 bg-white p-5 transition hover:-translate-y-1 hover:border-green-200 hover:shadow-md"
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition group-hover:bg-green-50 group-hover:text-green-700">
                              <FolderOpen size={24} />
                            </div>

                            <h3 className="mt-4 font-semibold text-gray-900 group-hover:text-green-700">
                              {child.name}
                            </h3>

                            <div className="mt-3 flex items-center justify-between text-xs font-medium text-gray-400">
                              <span>Explore products</span>
                              <ArrowRight
                                size={15}
                                className="transition group-hover:translate-x-1 group-hover:text-green-700"
                              />
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center">
                <FolderOpen
                  size={45}
                  className="mx-auto text-gray-300"
                />

                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  No categories found
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Try searching with another category name.
                </p>

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="mt-4 text-sm font-semibold text-green-700 hover:underline"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
