const BASE_URL = "https://sentinelreign.com";

export default async function sitemap() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  const articles = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/public/articles`, {
    signal: controller.signal,
    cache: "no-store"
  }).then(res => res.json())
    .catch(() => ({ data: [] }))
    .finally(() => clearTimeout(timeoutId));
  const pages = ["about-us", "privacy-policy", "terms-and-services"];
  const categories = ["technology", "cybersecurity", "science", "tutorial"];

  const articleEntries = (articles.data || []).map((a) => ({
    url: `${BASE_URL}/article/${a.slug}`,
    lastModified: new Date(a.published_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryEntries = categories.map((c) => ({
    url: `${BASE_URL}/category/${c}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const staticEntries = pages.map((p) => ({
    url: `${BASE_URL}/page/${p}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...articleEntries,
    ...categoryEntries,
    ...staticEntries,
  ];
}
