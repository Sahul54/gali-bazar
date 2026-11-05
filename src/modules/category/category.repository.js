import { prisma } from "@/lib/prisma.js";

export const categoryRepository = {
  async findActiveCategories() {
    return prisma.category.findMany({
      where: {
        isActive: true,
        parentId: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        sortOrder: true,

        children: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            imageUrl: true,
            sortOrder: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
    });
  },

  async findCategoryBySlug(slug) {
    return prisma.category.findFirst({
      where: {
        slug,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        parentId: true,
        children: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            slug: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });
  },
};