import { categoryRepository } from "./category.repository.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const categoryService = {
  // Get all active parent categories with subcategories.
  async getCategories() {
    const categories =
      await categoryRepository.findActiveCategories();

    return categories;
  },

  // Get individual category by slug.
  async getCategoryBySlug(slug) {
    if (!slug || typeof slug !== "string" || !slug.trim()) {
      throw createError("Valid category slug is required.");
    }

    const category =
      await categoryRepository.findCategoryBySlug(slug.trim());

    if (!category) {
      throw createError("Category not found.", 404);
    }

    return category;
  },
};