import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { escapeXml, readPublicCategories, readPublicTools } from "./seo-data.mjs";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = resolve(rootDir, "public");
const siteUrl = (process.env.SITE_URL || "https://newaitools.app").replace(/\/$/, "");
const today = new Date().toISOString().slice(0, 10);

const paths = [
  { loc: "/", priority: "1.0", changefreq: "daily" },
  ...readPublicCategories().map((category) => ({
    loc: `/categories/${category.id}`,
    priority: "0.7",
    changefreq: "weekly"
  })),
  ...readPublicTools().map((tool) => ({
    loc: `/tools/${tool.route}`,
    priority: "0.8",
    changefreq: "weekly"
  }))
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((item) => `  <url>
    <loc>${escapeXml(`${siteUrl}${item.loc}`)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

mkdirSync(publicDir, { recursive: true });
writeFileSync(resolve(publicDir, "sitemap.xml"), sitemap);
writeFileSync(resolve(publicDir, "robots.txt"), robots);

console.log(`Generated sitemap.xml with ${paths.length} URLs for ${siteUrl}`);
