import type { MetadataRoute } from "next";
import { getActiveCategories, getPublicProductSlugs } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/productos`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terminos`, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const categories = await getActiveCategories();
    for (const category of categories) {
      pages.push({
        url: `${SITE_URL}/productos/${category.slug}`,
        changeFrequency: "daily",
        priority: 0.7,
      });
    }
    for (const slug of await getPublicProductSlugs()) {
      pages.push({ url: `${SITE_URL}/producto/${slug}`, changeFrequency: "weekly", priority: 0.6 });
    }
  } catch {
    // The sitemap still serves static pages if the catalog is unreachable.
  }

  return pages;
}
