export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL!;
  return [{ url: base, changeFrequency: "weekly", priority: 0.7 }];
}
