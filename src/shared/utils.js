import React from "react";
import { defaultLocale, messages } from "../i18n/messages.js";

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
  link.setAttribute("href", `${window.location.origin}${window.location.pathname}#${pathname}`);
}

function usePageSeo(route, locale = defaultLocale) {
  React.useEffect(() => {
    const currentMessages = messages[locale] || messages[defaultLocale];
    const data = route === "vsco-downloader"
      ? {
          title: "VSCO Downloader - Extract Raw VSCO Image and Video URLs | ToolBox Hub",
          description: "VSCO Downloader is a simple browser tool based on michabirklbauer/vsco_downloader. A simple python library to extract raw image and video paths from VSCO posts.",
          keywords: "vsco downloader, VSCO Downloader, download VSCO images, download VSCO videos, extract VSCO media, A simple python library to extract raw image and video paths from VSCO posts.",
          canonical: "/vsco-downloader"
        }
      : route === "jsx-to-jsxbin"
      ? {
          title: "JSX to JSXBin 在线转换工具 - Adobe ExtendScript JSXBIN 编译 | 智用工具站",
          description: "在线将 Adobe ExtendScript JSX 转换为 JSXBIN。支持原生 JSXBin 编译接口、本地封装模式、复制、下载、校验和示例代码，适用于 After Effects、Photoshop、Illustrator 脚本保护。",
          keywords: "Convert jsx to jsxbin, jsx to jsxbin online, jsx to jsxbin converter, JSX to JSXBin, JSXBin converter, ExtendScript, Adobe JSXBIN, JSX 转 JSXBIN",
          canonical: "/jsx-to-jsxbin"
        }
      : route === "jsxbin-to-jsx"
        ? {
            title: "JSXBin to JSX 在线转换工具 - Adobe JSXBIN 反向解析 | 智用工具站",
            description: "在线解析 JSXBIN to JSX，支持本工具生成的 JSXBIN 完整还原为 JSX，并提供 Adobe 原生 JSXBIN 结构分析、复制、下载和安全提示。",
            keywords: "jsxbin to jsx, jsxbin to jsx online, jsxbin to jsx converter, Convert jsxbin to jsx, JSXBin decompiler, Adobe JSXBIN, ExtendScript",
            canonical: "/jsxbin-to-jsx"
          }
      : route === "pdf-word"
        ? {
            title: "PDF转Word 在线转换工具 - 免费本地转换 PDF 到 DOCX | 智用工具站",
            description: "免费在线 PDF 转 Word 工具，支持浏览器本地提取 PDF 文本并生成 DOCX 或 TXT 文件。",
            keywords: "PDF转Word, PDF to Word, 在线PDF转换, DOCX",
            canonical: "/pdf-word"
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
  }, [route, locale]);
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
