import React from "react";
import { categoryNames, defaultLocale, messages } from "../i18n/messages.js";

const categorySeoDescriptions = {
  ai: "AI写作、绘画、摘要、提示词、邮件、学习计划与自动化办公工具集合",
  seo: "关键词、Meta、Schema、Sitemap、Robots、页面速度与搜索增长工具集合",
  image: "图片压缩、格式转换、二维码、SVG、Favicon 与视觉素材处理工具集合",
  pdf: "PDF 转换、合并、拆分、压缩、加密、解密与文档处理工具集合",
  dev: "JSON、Base64、正则、UUID、哈希、SQL、YAML、HTTP 与开发调试工具集合",
  office: "会议纪要、OKR、日报、简历、发票、邮件签名与办公文档生成工具集合",
  text: "文本排序、Diff、繁简转换、拼音、敏感词、阅读时间与文案处理工具集合",
  media: "字幕、视频标题、播客大纲、音频清理、YouTube 标签与内容创作工具集合",
  data: "CSV、表格、JSON 路径、数据透视、列表交集与结构化数据处理工具集合",
  life: "BMI、小费、房贷、汇率、复利、折扣、番茄钟与日常生活计算工具集合"
};

function setMeta(name, content) {
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

function setCanonical(pathname) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", `${window.location.origin}${pathname}`);
}

function usePageSeo(route, locale = defaultLocale, activeToolRoute = null) {
  React.useEffect(() => {
    const currentMessages = messages[locale] || messages[defaultLocale];
    const categoryId = route.startsWith("category-") ? route.replace("category-", "") : "";
    const categoryLabel = categoryNames[locale]?.[categoryId] || categoryNames[defaultLocale]?.[categoryId];
    const data = activeToolRoute?.tool
      ? {
          title: `${activeToolRoute.tool.name} 在线工具 - ${activeToolRoute.tool.desc} | 智用工具站`,
          description: `${activeToolRoute.tool.desc}。打开即可在线使用，支持复制结果、下载文本、收藏和移动端访问。`,
          keywords: [activeToolRoute.tool.name, ...(activeToolRoute.tool.tags || []), "在线工具", "免费工具"].join(", "),
          canonical: activeToolRoute.path
        }
      : route === "vsco-downloader"
      ? {
          title: "VSCO Downloader - Extract Raw VSCO Image and Video URLs | ToolBox Hub",
          description: "VSCO Downloader is a simple browser tool based on michabirklbauer/vsco_downloader. A simple python library to extract raw image and video paths from VSCO posts.",
          keywords: "vsco downloader, VSCO Downloader, download VSCO images, download VSCO videos, extract VSCO media, A simple python library to extract raw image and video paths from VSCO posts.",
          canonical: "/tools/vsco-downloader"
        }
      : route === "jsx-to-jsxbin"
      ? {
          title: "JSX to JSXBin 在线转换工具 - Adobe ExtendScript JSXBIN 编译 | 智用工具站",
          description: "在线将 Adobe ExtendScript JSX 转换为 JSXBIN。支持原生 JSXBin 编译接口、本地封装模式、复制、下载、校验和示例代码，适用于 After Effects、Photoshop、Illustrator 脚本保护。",
          keywords: "Convert jsx to jsxbin, jsx to jsxbin online, jsx to jsxbin converter, JSX to JSXBin, JSXBin converter, ExtendScript, Adobe JSXBIN, JSX 转 JSXBIN",
          canonical: "/tools/jsx-to-jsxbin"
        }
      : route === "jsxbin-to-jsx"
        ? {
            title: "JSXBin to JSX 在线转换工具 - Adobe JSXBIN 反向解析 | 智用工具站",
            description: "在线解析 JSXBIN to JSX，支持本工具生成的 JSXBIN 完整还原为 JSX，并提供 Adobe 原生 JSXBIN 结构分析、复制、下载和安全提示。",
            keywords: "jsxbin to jsx, jsxbin to jsx online, jsxbin to jsx converter, Convert jsxbin to jsx, JSXBin decompiler, Adobe JSXBIN, ExtendScript",
            canonical: "/tools/jsxbin-to-jsx"
          }
      : route === "pdf-word"
        ? {
            title: "PDF转Word 在线转换工具 - 免费本地转换 PDF 到 DOCX | 智用工具站",
            description: "免费在线 PDF 转 Word 工具，支持浏览器本地提取 PDF 文本并生成 DOCX 或 TXT 文件。",
            keywords: "PDF转Word, PDF to Word, 在线PDF转换, DOCX",
            canonical: "/tools/pdf-word"
          }
        : categoryId && categoryLabel
          ? {
              title: `${categoryLabel}大全 - 免费在线${categoryLabel}集合 | 智用工具站`,
              description: `${categorySeoDescriptions[categoryId] || `${categoryLabel}精选集合`}。所有工具支持独立落地页、在线使用、复制结果、下载文本和移动端访问。`,
              keywords: [categoryLabel, "在线工具", "免费工具", "工具大全", "智用工具站"].join(", "),
              canonical: `/categories/${categoryId}`
            }
        : {
            title: `${currentMessages.brand} ${currentMessages.brandSub} - ${currentMessages.allTools}`,
            description: currentMessages.heroText,
            keywords: "在线工具, 工具站, PDF工具, AI工具, 开发工具",
            canonical: "/"
          };
    document.title = data.title;
    setMeta("description", data.description);
    setMeta("keywords", data.keywords);
    setCanonical(data.canonical);
  }, [route, locale, activeToolRoute]);
}

function scrollToSelector(selector) {
  window.requestAnimationFrame(() => {
    document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function toCsv(rows) {
  return rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
}


function formatBytes(value) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(2)} MB`;
}


export {
  usePageSeo,
  scrollToSelector,
  downloadBlob,
  toCsv,
  formatBytes
};
