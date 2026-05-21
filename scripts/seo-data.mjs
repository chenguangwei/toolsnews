import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expandedToolCatalog } from "../src/data/expandedTools.js";
import { genericToolSlugs } from "../src/tools/slugs.js";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const siteDataPath = resolve(rootDir, "src/data/siteData.jsx");
const publicCategoryDefinitions = [
  { id: "ai", name: "AI工具", desc: "AI写作、绘画、摘要、提示词、邮件、学习计划与自动化办公工具集合" },
  { id: "seo", name: "SEO工具", desc: "关键词、Meta、Schema、Sitemap、Robots、页面速度与搜索增长工具集合" },
  { id: "image", name: "图片工具", desc: "图片压缩、格式转换、二维码、SVG、Favicon 与视觉素材处理工具集合" },
  { id: "pdf", name: "PDF工具", desc: "PDF 转换、合并、拆分、压缩、加密、解密与文档处理工具集合" },
  { id: "dev", name: "开发工具", desc: "JSON、Base64、正则、UUID、哈希、SQL、YAML、HTTP 与开发调试工具集合" },
  { id: "office", name: "办公工具", desc: "会议纪要、OKR、日报、简历、发票、邮件签名与办公文档生成工具集合" },
  { id: "text", name: "文本工具", desc: "文本排序、Diff、繁简转换、拼音、敏感词、阅读时间与文案处理工具集合" },
  { id: "media", name: "视频音频", desc: "字幕、视频标题、播客大纲、音频清理、YouTube 标签与内容创作工具集合" },
  { id: "data", name: "数据分析", desc: "CSV、表格、JSON 路径、数据透视、列表交集与结构化数据处理工具集合" },
  { id: "life", name: "生活工具", desc: "BMI、小费、房贷、汇率、复利、折扣、番茄钟与日常生活计算工具集合" }
];

function stripQuotes(value = "") {
  return value.replace(/^["']|["']$/g, "");
}

function parseStringProperty(block, key) {
  return block.match(new RegExp(`${key}:\\s*"([^"]*)"`))?.[1] || "";
}

function parseArrayProperty(block, key) {
  const match = block.match(new RegExp(`${key}:\\s*\\[([^\\]]*)\\]`));
  if (!match) return [];
  return match[1]
    .split(",")
    .map((item) => stripQuotes(item.trim()))
    .filter(Boolean);
}

function readPublicTools(source = readFileSync(siteDataPath, "utf8")) {
  const baseTools = [...source.matchAll(/\{\s*id:\s*"([^"]+)"[\s\S]*?tools:\s*\[([\s\S]*?)\n\s*\]/g)]
    .flatMap((groupMatch) => {
      const category = groupMatch[1];
      return [...groupMatch[2].matchAll(/\{[^{}]*name:\s*"([^"]+)"[^{}]*\}/g)].map((toolMatch) => {
        const block = toolMatch[0];
        const name = toolMatch[1];
        const route = parseStringProperty(block, "route") || genericToolSlugs[name];
        return {
          name,
          route,
          category,
          desc: parseStringProperty(block, "desc"),
          rating: parseStringProperty(block, "rating"),
          users: parseStringProperty(block, "users"),
          tags: parseArrayProperty(block, "tags"),
          featured: /featured:\s*true/.test(block)
        };
      });
    })
    .filter((tool) => tool.route);

  const expandedTools = expandedToolCatalog.map(({ iconKey, sample, ...tool }) => tool);
  const toolsByRoute = new Map();

  [...baseTools, ...expandedTools].forEach((tool) => {
    if (tool.route && !toolsByRoute.has(tool.route)) {
      toolsByRoute.set(tool.route, tool);
    }
  });

  return [...toolsByRoute.values()];
}

function readPublicCategories(tools = readPublicTools()) {
  const counts = tools.reduce((result, tool) => {
    result[tool.category] = (result[tool.category] || 0) + 1;
    return result;
  }, {});
  return publicCategoryDefinitions.map((category) => ({
    ...category,
    count: counts[category.id] || 0
  }));
}

function buildToolSeo(tool, siteUrl = "https://newaitools.app") {
  const cleanSiteUrl = siteUrl.replace(/\/$/, "");
  const path = `/tools/${tool.route}`;
  const title = `${tool.name} 在线工具 - ${tool.desc} | 智用工具站`;
  const description = `${tool.desc}。在线使用 ${tool.name}，支持独立落地页、收藏、复制结果、下载文本和移动端访问。`;
  const keywords = [tool.name, ...tool.tags, "在线工具", "免费工具", "智用工具站"].join(", ");
  return {
    title,
    description,
    keywords,
    path,
    url: `${cleanSiteUrl}${path}`
  };
}

function buildCategorySeo(category, siteUrl = "https://newaitools.app") {
  const cleanSiteUrl = siteUrl.replace(/\/$/, "");
  const path = `/categories/${category.id}`;
  const title = `${category.name}大全 - 免费在线${category.name}集合 | 智用工具站`;
  const description = `${category.desc}。收录 ${category.count || 0} 个可直接使用的在线工具，覆盖独立落地页、收藏、复制结果、下载文本和移动端访问。`;
  const keywords = [category.name, "在线工具", "免费工具", "工具大全", "智用工具站"].join(", ");
  return {
    title,
    description,
    keywords,
    path,
    url: `${cleanSiteUrl}${path}`
  };
}

function escapeHtml(value) {
  return String(value).replace(/[<>&'"]/g, (char) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&#39;",
    "\"": "&quot;"
  }[char]));
}

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, (char) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    "\"": "&quot;"
  }[char]));
}

export {
  buildCategorySeo,
  buildToolSeo,
  escapeHtml,
  escapeXml,
  readPublicCategories,
  readPublicTools
};
