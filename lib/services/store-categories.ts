import { prisma } from "@/lib/db/prisma";

export async function listStoreCategoryOptions() {
  const [items, existingStoreCategories] = await Promise.all([
    prisma.storeCategoryOption.findMany({
      orderBy: { name: "asc" },
      select: { name: true },
    }),
    prisma.store.findMany({
      where: { category: "OTHER", customCategory: { not: null } },
      select: { customCategory: true },
    }),
  ]);

  const names = new Set(items.map((item) => item.name));
  for (const row of existingStoreCategories) {
    if (row.customCategory) names.add(row.customCategory);
  }

  return Array.from(names).sort((a, b) => a.localeCompare(b));
}
