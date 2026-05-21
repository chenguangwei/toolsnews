import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCategorySeo, buildToolSeo, escapeHtml, readPublicCategories, readPublicTools } from "./seo-data.mjs";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = resolve(rootDir, "dist");
const siteUrl = (process.env.SITE_URL || "https://newaitools.app").replace(/\/$/, "");
const shellPath = resolve(distDir, "index.html");
const shell = readFileSync(shellPath, "utf8");
const tools = readPublicTools();
const categories = readPublicCategories(tools);

function parseAudienceCount(value) {
  const text = String(value || "").trim().toUpperCase();
  const number = Number.parseFloat(text.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(number)) return 1000;
  if (text.includes("万")) return Math.round(number * 10000);
  if (text.includes("M")) return Math.round(number * 1000000);
  if (text.includes("K")) return Math.round(number * 1000);
  return Math.max(1, Math.round(number));
}

function jsonLdForTool(tool, seo) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    url: seo.url,
    description: seo.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    aggregateRating: tool.rating ? {
      "@type": "AggregateRating",
      ratingValue: tool.rating,
      ratingCount: parseAudienceCount(tool.users)
    } : undefined
  };
}

function renderSeoFallback(tool, seo) {
  const tagList = tool.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("");
  return `<main class="seo-prerender">
      <h1>${escapeHtml(tool.name)}</h1>
      <p>${escapeHtml(seo.description)}</p>
      <ul>${tagList}</ul>
      <p>评分 ${escapeHtml(tool.rating || "4.8")}，累计 ${escapeHtml(tool.users || "10K")} 使用。</p>
    </main>`;
}

function jsonLdForCategory(category, seo, categoryTools) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    url: seo.url,
    description: seo.description,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: categoryTools.length,
      itemListElement: categoryTools.slice(0, 24).map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: tool.name,
        url: `${siteUrl}/tools/${tool.route}`
      }))
    }
  };
}

function renderCategoryFallback(category, seo, categoryTools) {
  const toolList = categoryTools
    .slice(0, 36)
    .map((tool) => `<li><a href="/tools/${escapeHtml(tool.route)}">${escapeHtml(tool.name)}</a> - ${escapeHtml(tool.desc)}</li>`)
    .join("");
  return `<main class="seo-prerender">
      <h1>${escapeHtml(category.name)}大全</h1>
      <p>${escapeHtml(seo.description)}</p>
      <ul>${toolList}</ul>
    </main>`;
}

function renderToolHtml(tool) {
  const seo = buildToolSeo(tool, siteUrl);
  const structuredData = JSON.stringify(jsonLdForTool(tool, seo)).replace(/</g, "\\u003c");
  const headTags = [
    `<title>${escapeHtml(seo.title)}</title>`,
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="keywords" content="${escapeHtml(seo.keywords)}" />`,
    `<link rel="canonical" href="${escapeHtml(seo.url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(seo.url)}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
    `<script type="application/ld+json">${structuredData}</script>`
  ].join("\n    ");

  return shell
    .replace(/<title>[\s\S]*?<\/title>/, headTags)
    .replace('<div id="root"></div>', `<div id="root">\n    ${renderSeoFallback(tool, seo)}\n    </div>`);
}

function renderCategoryHtml(category) {
  const seo = buildCategorySeo(category, siteUrl);
  const categoryTools = tools.filter((tool) => tool.category === category.id);
  const structuredData = JSON.stringify(jsonLdForCategory(category, seo, categoryTools)).replace(/</g, "\\u003c");
  const headTags = [
    `<title>${escapeHtml(seo.title)}</title>`,
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="keywords" content="${escapeHtml(seo.keywords)}" />`,
    `<link rel="canonical" href="${escapeHtml(seo.url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(seo.url)}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
    `<script type="application/ld+json">${structuredData}</script>`
  ].join("\n    ");

  return shell
    .replace(/<title>[\s\S]*?<\/title>/, headTags)
    .replace('<div id="root"></div>', `<div id="root">\n    ${renderCategoryFallback(category, seo, categoryTools)}\n    </div>`);
}

tools.forEach((tool) => {
  const outputDir = resolve(distDir, "tools", tool.route);
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(resolve(outputDir, "index.html"), renderToolHtml(tool));
});

categories.forEach((category) => {
  const outputDir = resolve(distDir, "categories", category.id);
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(resolve(outputDir, "index.html"), renderCategoryHtml(category));
});

console.log(`Prerendered ${tools.length} tool HTML pages and ${categories.length} category HTML pages`);
