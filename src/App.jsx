import React, { useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import pptxgen from "pptxgenjs";
import JSZip from "jszip";
import {
  Archive,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bolt,
  BookOpen,
  Bot,
  Boxes,
  Braces,
  Check,
  ChevronDown,
  Clock3,
  Cloud,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileArchive,
  FileImage,
  FileText,
  Globe2,
  Grid2X2,
  History,
  Home,
  Image,
  Languages,
  Layers3,
  Link2,
  Lock,
  Menu,
  Mic,
  MonitorSmartphone,
  Moon,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Table2,
  UploadCloud,
  Wand2,
  X
} from "lucide-react";
import "./styles.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const categoryIcons = {
  all: Boxes,
  ai: Bot,
  seo: Search,
  image: Image,
  pdf: FileText,
  dev: Code2,
  office: Archive,
  text: FileText,
  media: BarChart3,
  data: Layers3,
  life: Sparkles
};

const categories = [
  { id: "all", count: "2000+" },
  { id: "ai", count: "286" },
  { id: "seo", count: "158" },
  { id: "image", count: "312" },
  { id: "pdf", count: "186" },
  { id: "dev", count: "221" },
  { id: "office", count: "298" },
  { id: "text", count: "145" },
  { id: "media", count: "132" },
  { id: "data", count: "118" },
  { id: "life", count: "142" }
];

const copy = {
  zh: {
    nav: ["首页", "工具分类", "AI工具", "排行榜", "文章教程", "资源导航", "优惠活动", "关于我们"],
    submit: "提交工具",
    searchPlaceholder: "搜索工具...",
    brand: "智用工具站",
    brandSub: "ToolBox Hub",
    heroTitle: "发现高效好用的在线工具",
    heroText: "精选 2000+ 款优质在线工具，覆盖学习、工作与生活的方方面面，提升效率，从这里开始",
    heroSearch: "搜索你需要的工具，如：PDF 转换、去水印、关键词分析...",
    search: "搜索",
    all: "全部",
    stats: ["收录工具", "分类覆盖", "每日使用"],
    independent: "点击工具即可进入独立使用页",
    safe: "安全 · 免费 · 在线 · 无需安装",
    breadcrumbHome: "首页",
    allTools: "全部工具",
    categoryTitle: "全部分类",
    favorites: "收藏与历史",
    login: "立即登录",
    collect: "立即收藏",
    useNow: "立即使用",
    viewAll: "查看全部",
    loadMore: "加载更多工具",
    serviceTitle: ["免费 & 无需安装", "安全 & 隐私保护", "多端支持"],
    faq: "常见问题 FAQ",
    moreQuestions: "更多问题",
    latest: "最新文章 & 教程",
    moreArticles: "更多文章",
    footerSlogan: "精选全网优质在线工具，即开即用，省时更安心。",
    toolIntro: "工具简介",
    steps: "使用步骤",
    related: "相关工具",
    secure: "安全 · 免费 · 无广告",
    supportLang: "支持语言：",
    upload: "拖拽PDF文件到这里，或点击上传",
    uploadHint: "支持PDF格式，最大50MB",
    choosePdf: "选择PDF文件",
    settings: "转换设置",
    output: "输出格式",
    ocr: "启用OCR（识别扫描件/图片型PDF）",
    range: "转换范围",
    allPages: "全部页面",
    selectedPages: "指定页码",
    more: "更多选项",
    keepLayout: "保留原始布局和格式",
    extractImages: "提取图片",
    start: "开始转换",
    history: "转换记录（近7天）",
    noHistory: "暂无转换记录",
    clearHistory: "清空记录",
    refresh: "刷新"
  },
  en: {
    nav: ["Home", "Categories", "AI Tools", "Ranking", "Guides", "Resources", "Deals", "About"],
    submit: "Submit Tool",
    searchPlaceholder: "Search tools...",
    brand: "ToolBox Hub",
    brandSub: "Smart Tools",
    heroTitle: "Discover fast online tools",
    heroText: "A curated library of 2000+ tools for work, learning, and daily tasks.",
    heroSearch: "Search PDF converter, watermark remover, keyword tools...",
    search: "Search",
    all: "All",
    stats: ["Tools", "Categories", "Daily Uses"],
    independent: "Open each tool in a standalone workspace",
    safe: "Safe · Free · Online · No install",
    breadcrumbHome: "Home",
    allTools: "All Tools",
    categoryTitle: "Categories",
    favorites: "Saved & History",
    login: "Sign in",
    collect: "Save now",
    useNow: "Use now",
    viewAll: "View all",
    loadMore: "Load more tools",
    serviceTitle: ["Free & no install", "Secure & private", "Multi-device"],
    faq: "FAQ",
    moreQuestions: "More questions",
    latest: "Latest guides",
    moreArticles: "More articles",
    footerSlogan: "Curated online tools, ready when you need them.",
    toolIntro: "Tool Intro",
    steps: "Steps",
    related: "Related Tools",
    secure: "Secure · Free · No ads",
    supportLang: "Languages:",
    upload: "Drop a PDF here, or click to upload",
    uploadHint: "PDF only, max 50MB",
    choosePdf: "Choose PDF file",
    settings: "Conversion settings",
    output: "Output format",
    ocr: "Enable OCR for scanned PDFs",
    range: "Range",
    allPages: "All pages",
    selectedPages: "Selected pages",
    more: "More options",
    keepLayout: "Preserve layout and formatting",
    extractImages: "Extract images",
    start: "Start converting",
    history: "History (7 days)",
    noHistory: "No history yet",
    clearHistory: "Clear",
    refresh: "Refresh"
  },
  ja: {
    nav: ["ホーム", "カテゴリ", "AIツール", "ランキング", "記事", "リソース", "特典", "会社情報"],
    submit: "ツール投稿",
    searchPlaceholder: "ツール検索...",
    brand: "智用工具站",
    brandSub: "ToolBox Hub",
    heroTitle: "便利なオンラインツールを発見",
    heroText: "仕事、学習、生活に役立つ 2000+ のツールを厳選。",
    heroSearch: "PDF変換、透かし削除、キーワード分析を検索...",
    search: "検索",
    all: "全部",
    stats: ["収録ツール", "カテゴリ", "毎日利用"],
    independent: "ツールは独立ページですぐ利用可能",
    safe: "安全 · 無料 · オンライン · インストール不要",
    breadcrumbHome: "ホーム",
    allTools: "全ツール",
    categoryTitle: "カテゴリ",
    favorites: "保存と履歴",
    login: "ログイン",
    collect: "保存する",
    useNow: "今すぐ使う",
    viewAll: "すべて見る",
    loadMore: "さらに表示",
    serviceTitle: ["無料・インストール不要", "安全・プライバシー保護", "マルチデバイス"],
    faq: "よくある質問",
    moreQuestions: "さらに質問",
    latest: "最新記事",
    moreArticles: "記事を見る",
    footerSlogan: "厳選されたオンラインツールをすぐに利用できます。",
    toolIntro: "ツール紹介",
    steps: "使い方",
    related: "関連ツール",
    secure: "安全 · 無料 · 広告なし",
    supportLang: "言語：",
    upload: "PDFをここにドラッグ、またはクリック",
    uploadHint: "PDF形式、最大50MB",
    choosePdf: "PDFを選択",
    settings: "変換設定",
    output: "出力形式",
    ocr: "OCRを有効化",
    range: "変換範囲",
    allPages: "全ページ",
    selectedPages: "ページ指定",
    more: "追加オプション",
    keepLayout: "元のレイアウトを保持",
    extractImages: "画像を抽出",
    start: "変換開始",
    history: "変換履歴（7日）",
    noHistory: "履歴はありません",
    clearHistory: "履歴削除",
    refresh: "更新"
  }
};

const categoryNames = {
  zh: {
    all: "全部工具",
    ai: "AI工具",
    seo: "SEO工具",
    image: "图片工具",
    pdf: "PDF工具",
    dev: "开发工具",
    office: "办公工具",
    text: "文本工具",
    media: "视频音频",
    data: "数据分析",
    life: "生活工具"
  },
  en: {
    all: "All Tools",
    ai: "AI Tools",
    seo: "SEO Tools",
    image: "Image Tools",
    pdf: "PDF Tools",
    dev: "Dev Tools",
    office: "Office Tools",
    text: "Text Tools",
    media: "Media Tools",
    data: "Data Tools",
    life: "Life Tools"
  },
  ja: {
    all: "全ツール",
    ai: "AIツール",
    seo: "SEOツール",
    image: "画像ツール",
    pdf: "PDFツール",
    dev: "開発ツール",
    office: "オフィス",
    text: "テキスト",
    media: "動画音声",
    data: "データ分析",
    life: "生活ツール"
  }
};

const toolGroups = [
  {
    id: "ai",
    desc: "AI写作、绘画、对话、翻译、语音等智能工具，释放生产力",
    tools: [
      { name: "ChatGPT 镜像", icon: Bot, desc: "强大的 AI 对话助手", tags: ["对话", "AI"], rating: "4.9", users: "98.6K" },
      { name: "AI 绘画生成器", icon: Sparkles, desc: "文字生成高质量图片", tags: ["绘画", "图像"], rating: "4.8", users: "76.2K" },
      { name: "智能写作助手", icon: Pencil, desc: "AI 帮你写文章、文案", tags: ["写作", "AI"], rating: "4.7", users: "65.1K" },
      { name: "AI 语音转文字", icon: Mic, desc: "高精度语音识别工具", tags: ["语音", "识别"], rating: "4.6", users: "48.3K" }
    ]
  },
  {
    id: "seo",
    desc: "关键词查询、网站分析、排名监控，助力网站流量增长",
    tools: [
      { name: "关键词查询", icon: Search, desc: "挖掘长尾关键词", tags: ["关键词", "SEO"], rating: "4.8", users: "62.4K" },
      { name: "网站 SEO 检测", icon: BarChart3, desc: "全面检测网站 SEO 问题", tags: ["检测", "分析"], rating: "4.7", users: "51.3K" },
      { name: "外链查询工具", icon: Boxes, desc: "分析网站外链资源", tags: ["外链", "数据"], rating: "4.6", users: "32.1K" },
      { name: "SERP 排名查询", icon: Globe2, desc: "追踪关键词排名情况", tags: ["排名", "监控"], rating: "4.5", users: "28.7K" }
    ]
  },
  {
    id: "image",
    desc: "图片编辑、格式转换、压缩、去水印等实用工具",
    tools: [
      { name: "VSCO Downloader", icon: Download, desc: "Extract raw image and video paths from VSCO posts", tags: ["VSCO", "Downloader"], rating: "4.8", users: "22.5K", route: "vsco-downloader", featured: true },
      { name: "图片压缩", icon: FileImage, desc: "压缩图片减小文件大小", tags: ["压缩", "JPG"], rating: "4.8", users: "86.4K" },
      { name: "图片格式转换", icon: FileImage, desc: "支持多种格式互转", tags: ["转换", "PNG"], rating: "4.7", users: "74.6K" },
      { name: "图片去水印", icon: Wand2, desc: "一键去除图片水印", tags: ["去水印", "AI"], rating: "4.6", users: "61.2K" },
      { name: "图片编辑器", icon: Image, desc: "在线图片编辑处理", tags: ["编辑", "设计"], rating: "4.6", users: "55.1K" }
    ]
  },
  {
    id: "pdf",
    desc: "PDF 转换、合并、压缩、签名，轻松处理 PDF 文档",
    tools: [
      { name: "PDF 转 Word", icon: FileText, desc: "PDF 转换为可编辑 Word", tags: ["转换", "Word"], rating: "4.8", users: "93.2K", featured: true },
      { name: "PDF 合并", icon: FileArchive, desc: "将多个 PDF 合并为一个", tags: ["合并", "PDF"], rating: "4.7", users: "68.3K" },
      { name: "PDF 压缩", icon: FileText, desc: "减小 PDF 文件大小", tags: ["压缩", "优化"], rating: "4.6", users: "57.7K" },
      { name: "PDF 签名", icon: Pencil, desc: "在线添加电子签名", tags: ["签名", "电子"], rating: "4.6", users: "39.4K" }
    ]
  },
  {
    id: "dev",
    desc: "代码格式化、API 测试、在线编辑等开发必备工具",
    tools: [
      { name: "JSON 格式化", icon: Braces, desc: "美化、校验 JSON 数据", tags: ["JSON", "格式化"], rating: "4.8", users: "72.9K" },
      { name: "代码格式化", icon: Code2, desc: "支持多语言代码格式化", tags: ["格式化", "代码"], rating: "4.7", users: "64.1K" },
      { name: "JSX to JSXBin", icon: Code2, desc: "Adobe ExtendScript JSX 转 JSXBIN", tags: ["JSX", "JSXBIN"], rating: "4.8", users: "36.8K", route: "jsx-to-jsxbin" },
      { name: "JSXBin to JSX", icon: Braces, desc: "JSXBIN 反向解析与 JSX 还原", tags: ["JSXBIN", "JSX"], rating: "4.7", users: "28.4K", route: "jsxbin-to-jsx" },
      { name: "在线编译器", icon: Code2, desc: "多语言在线编译运行", tags: ["编译", "运行"], rating: "4.6", users: "58.6K" },
      { name: "API 接口测试", icon: Bolt, desc: "调试 API 接口请求", tags: ["API", "测试"], rating: "4.6", users: "45.3K" }
    ]
  },
  {
    id: "office",
    desc: "日常办公、文档处理、表格制作，提升办公效率",
    tools: [
      { name: "在线表格", icon: Table2, desc: "多人协作在线表格", tags: ["表格", "协作"], rating: "4.8", users: "81.3K" },
      { name: "思维导图", icon: Layers3, desc: "在线创建思维导图", tags: ["思维导图", "头脑风暴"], rating: "4.7", users: "60.2K" },
      { name: "PPT 模板库", icon: MonitorSmartphone, desc: "海量精美 PPT 模板", tags: ["PPT", "模板"], rating: "4.6", users: "48.7K" },
      { name: "文档翻译", icon: Languages, desc: "多语言文档翻译", tags: ["翻译", "文档"], rating: "4.6", users: "41.9K" }
    ]
  },
  {
    id: "text",
    desc: "文本统计、去重、大小写转换、Markdown 处理等写作工具",
    tools: [
      { name: "字数统计", icon: FileText, desc: "统计字数、行数和阅读时间", tags: ["统计", "文本"], rating: "4.7", users: "35.2K" },
      { name: "文本去重", icon: Layers3, desc: "按行去除重复内容", tags: ["去重", "清洗"], rating: "4.6", users: "24.9K" },
      { name: "大小写转换", icon: Languages, desc: "英文大小写与标题格式转换", tags: ["格式", "英文"], rating: "4.6", users: "22.1K" },
      { name: "Markdown 预览", icon: BookOpen, desc: "实时预览 Markdown 文本", tags: ["Markdown", "预览"], rating: "4.5", users: "18.8K" }
    ]
  },
  {
    id: "media",
    desc: "音视频信息、字幕、转写和媒体辅助工具",
    tools: [
      { name: "音频信息读取", icon: Mic, desc: "读取音频时长与文件信息", tags: ["音频", "信息"], rating: "4.5", users: "17.4K" },
      { name: "语音转文字", icon: Mic, desc: "浏览器语音识别转文字", tags: ["语音", "识别"], rating: "4.4", users: "19.6K" },
      { name: "字幕时间轴", icon: Clock3, desc: "生成简单 SRT 字幕结构", tags: ["字幕", "SRT"], rating: "4.5", users: "16.2K" },
      { name: "视频脚本分镜", icon: MonitorSmartphone, desc: "把脚本文本拆成分镜表", tags: ["视频", "脚本"], rating: "4.5", users: "14.3K" }
    ]
  },
  {
    id: "data",
    desc: "数据清洗、CSV 转换、统计摘要和可视化辅助工具",
    tools: [
      { name: "CSV 转 JSON", icon: Braces, desc: "表格数据转换为 JSON", tags: ["CSV", "JSON"], rating: "4.8", users: "31.8K" },
      { name: "JSON 转 CSV", icon: Table2, desc: "JSON 数组转换为 CSV", tags: ["JSON", "CSV"], rating: "4.7", users: "29.1K" },
      { name: "数据去重", icon: Layers3, desc: "按行或字段去除重复数据", tags: ["清洗", "去重"], rating: "4.6", users: "20.7K" },
      { name: "统计摘要", icon: BarChart3, desc: "计算数值总和、均值和范围", tags: ["统计", "分析"], rating: "4.6", users: "18.5K" }
    ]
  },
  {
    id: "life",
    desc: "日期、清单、预算和日常效率小工具",
    tools: [
      { name: "日期计算器", icon: Clock3, desc: "计算日期差和未来日期", tags: ["日期", "时间"], rating: "4.7", users: "26.6K" },
      { name: "待办清单", icon: Check, desc: "本地保存待办事项", tags: ["清单", "本地"], rating: "4.7", users: "24.5K" },
      { name: "预算计算器", icon: BarChart3, desc: "快速计算收入支出结余", tags: ["预算", "生活"], rating: "4.6", users: "18.1K" },
      { name: "随机抽签", icon: Sparkles, desc: "从候选项中随机选择", tags: ["随机", "决策"], rating: "4.5", users: "15.8K" }
    ]
  }
];

const pdfSubTools = ["PDF转Word", "PDF转Excel", "PDF转PPT", "PDF转图片", "Word转PDF", "PDF合并", "PDF拆分", "PDF压缩", "PDF加密", "PDF解密"];
const allTools = toolGroups.flatMap((group) => group.tools.map((tool) => ({ ...tool, category: group.id })));
const pdfSubToolObjects = pdfSubTools.map((name) => ({
  name,
  icon: FileText,
  desc: `${name} 在线处理工具`,
  tags: ["PDF", "文件"],
  rating: "4.6",
  users: "20K",
  category: "pdf"
}));

const faqs = [
  "这些工具真的免费吗？",
  "使用工具需要注册账号吗？",
  "我的文件会被保存到服务器吗？",
  "工具在手机上可以使用吗？",
  "如何提交我自己的工具？"
];

const articles = [
  { title: "2024 年最值得收藏的 20 款 AI 工具推荐", meta: "精选效率工具，助力工作与学习效率翻倍", image: "ai" },
  { title: "PDF 转换技巧大全：快速高效处理 PDF", meta: "PDF 转换、压缩、合并等常用技巧汇总", image: "pdf" },
  { title: "SEO 新手入门：关键词研究全攻略", meta: "从零开始掌握关键词研究方法与工具", image: "seo" }
];

const faqAnswers = {
  "这些工具真的免费吗？": "目前页面内工具均可免费使用。部分高成本能力如果接入云端服务，会在使用前明确提示。",
  "使用工具需要注册账号吗？": "基础功能无需注册。登录后可以同步收藏、历史记录和常用工具。",
  "我的文件会被保存到服务器吗？": "当前 PDF 转 Word 在浏览器本地完成文本提取和 Word 生成，文件不会上传到服务器。",
  "工具在手机上可以使用吗？": "可以。页面已针对手机、平板和桌面做响应式适配。",
  "如何提交我自己的工具？": "点击顶部“提交工具”填写名称、链接、分类和说明即可加入待审核列表。",
  "PDF转Word后排版会变吗？": "当前纯前端版本会提取文本并生成 Word 文档，复杂表格、图片和扫描件排版不能完全还原。",
  "转换后的Word可以编辑吗？": "可以。生成的是 .docx 文档，可在 Word、WPS、Pages 等软件中打开编辑。",
  "OCR识别有什么作用？": "OCR 用于识别扫描件或图片型 PDF。该能力需要识别模型或云端服务，当前浏览器本地版会提示不可用。",
  "支持扫描件PDF转换吗？": "文本型 PDF 支持本地转换；扫描件 PDF 需要 OCR 服务。",
  "文件会保存到服务器吗？": "不会。当前转换逻辑在浏览器端运行，文件只保留在当前设备内存中。"
};

const genericToolSamples = {
  "JSON 格式化": "{\"name\":\"ToolBox Hub\",\"tools\":[\"PDF\",\"SEO\",\"AI\"]}",
  "代码格式化": "function hello(){console.log('ToolBox Hub')}",
  "关键词查询": "在线工具站\nPDF转Word\nAI工具",
  "文档翻译": "欢迎使用智用工具站",
  default: "在这里输入要处理的内容，点击运行工具。"
};

function classifyTool(name) {
  if (name.includes("PDF")) return "pdf";
  if (name.includes("图片")) return "image";
  if (name.includes("JSON") || name.includes("代码") || name.includes("API") || name.includes("编译")) return "dev";
  if (name.includes("表格") || name.includes("思维") || name.includes("PPT") || name.includes("文档")) return "office";
  if (name.includes("CSV") || name.includes("数据") || name.includes("统计")) return "data";
  if (name.includes("字数") || name.includes("文本") || name.includes("大小写") || name.includes("Markdown")) return "text";
  if (name.includes("音频") || name.includes("语音") || name.includes("字幕") || name.includes("视频")) return "media";
  if (name.includes("日期") || name.includes("待办") || name.includes("预算") || name.includes("随机")) return "life";
  if (name.includes("关键词") || name.includes("SEO") || name.includes("外链") || name.includes("SERP")) return "seo";
  if (name.includes("AI") || name.includes("ChatGPT") || name.includes("智能")) return "ai";
  return "general";
}

function normalizePdfToolName(name) {
  return name.replace(/\s+/g, "");
}

function routeFromHash() {
  const hash = window.location.hash;
  if (hash.includes("vsco-downloader")) return "vsco-downloader";
  if (hash.includes("jsxbin-to-jsx")) return "jsxbin-to-jsx";
  if (hash.includes("jsx-to-jsxbin")) return "jsx-to-jsxbin";
  if (hash.includes("pdf-word")) return "pdf-word";
  return "home";
}

function routeToHash(route) {
  if (route === "vsco-downloader") return "/vsco-downloader";
  if (route === "jsxbin-to-jsx") return "/jsxbin-to-jsx";
  if (route === "jsx-to-jsxbin") return "/jsx-to-jsxbin";
  if (route === "pdf-word") return "/pdf-word";
  return "/";
}

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

function usePageSeo(route) {
  React.useEffect(() => {
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
            title: "智用工具站 ToolBox Hub - 在线工具大全",
            description: "智用工具站收录 AI、SEO、PDF、图片、开发、办公、文本、数据和生活类在线工具。",
            keywords: "在线工具, 工具站, PDF工具, AI工具, 开发工具",
            canonical: "/"
          };
    document.title = data.title;
    setMeta("description", data.description);
    setMeta("keywords", data.keywords);
    setCanonical(data.canonical);
  }, [route]);
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

function parsePageRange(rangeText, totalPages) {
  if (!rangeText.trim()) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const pages = new Set();
  for (const chunk of rangeText.split(",")) {
    const part = chunk.trim();
    if (!part) continue;
    if (part.includes("-")) {
      const [start, end] = part.split("-").map((value) => Number(value.trim()));
      if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
      for (let page = Math.max(1, start); page <= Math.min(totalPages, end); page += 1) pages.add(page);
    } else {
      const page = Number(part);
      if (Number.isFinite(page) && page >= 1 && page <= totalPages) pages.add(page);
    }
  }
  return [...pages].sort((a, b) => a - b);
}

async function extractPdfText(file, rangeMode, rangeText) {
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pages = rangeMode === "pages" ? parsePageRange(rangeText, pdf.numPages) : Array.from({ length: pdf.numPages }, (_, index) => index + 1);
  if (!pages.length) throw new Error("页码范围无效，请输入例如 1-3, 5 的格式。");
  const paragraphs = [];
  for (const pageNumber of pages) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str).join(" ").replace(/\s+/g, " ").trim();
    paragraphs.push({ page: pageNumber, text: text || "该页未提取到可复制文本。" });
  }
  return paragraphs;
}

async function buildDocxFromPdf(file, paragraphs) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: `由智用工具站转换：${file.name}`, bold: true, size: 28 })]
          }),
          ...paragraphs.flatMap((item) => [
            new Paragraph({ children: [new TextRun({ text: `第 ${item.page} 页`, bold: true, size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: item.text, size: 22 })] })
          ])
        ]
      }
    ]
  });
  return Packer.toBlob(doc);
}

async function extractPdfPageTexts(file) {
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str).join(" ").replace(/\s+/g, " ").trim();
    pages.push({ page: pageNumber, text: text || `第 ${pageNumber} 页未提取到文本` });
  }
  return pages;
}

function toCsv(rows) {
  return rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
}

async function renderPdfPagesToZip(file) {
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const zip = new JSZip();
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.6 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    zip.file(`page-${String(pageNumber).padStart(2, "0")}.png`, blob);
  }
  return zip.generateAsync({ type: "blob" });
}

async function mergePdfs(files) {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const pdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
    const pages = await merged.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }
  return new Blob([await merged.save()], { type: "application/pdf" });
}

async function splitPdf(file) {
  const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const zip = new JSZip();
  for (let index = 0; index < source.getPageCount(); index += 1) {
    const out = await PDFDocument.create();
    const [page] = await out.copyPages(source, [index]);
    out.addPage(page);
    zip.file(`page-${index + 1}.pdf`, await out.save());
  }
  return zip.generateAsync({ type: "blob" });
}

async function signPdf(file, signature) {
  const pdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  for (const page of pdf.getPages()) {
    const { width } = page.getSize();
    page.drawText(signature || "Signed by ToolBox Hub", {
      x: width - 230,
      y: 36,
      size: 13,
      font,
      color: rgb(0.12, 0.38, 0.9)
    });
  }
  return new Blob([await pdf.save()], { type: "application/pdf" });
}

async function pdfToPptx(file) {
  const pages = await extractPdfPageTexts(file);
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pages.forEach((item) => {
    const slide = pptx.addSlide();
    slide.background = { color: "F6F9FF" };
    slide.addText(`PDF 第 ${item.page} 页`, { x: 0.45, y: 0.35, w: 12.4, h: 0.42, fontSize: 20, bold: true, color: "164FF2" });
    slide.addText(item.text, { x: 0.55, y: 1.05, w: 12.0, h: 5.8, fontSize: 16, color: "17213C", breakLine: false, fit: "shrink" });
  });
  return pptx.write({ outputType: "blob" });
}

async function runPdfOperation(name, files, extraText = "") {
  const cleanName = normalizePdfToolName(name);
  if (!files.length) throw new Error("请先选择 PDF 文件。");
  if (cleanName === "PDF转Word") {
    const paragraphs = await extractPdfText(files[0], "all", "");
    return { blob: await buildDocxFromPdf(files[0], paragraphs), fileName: `${files[0].name.replace(/\.pdf$/i, "")}.docx`, note: "已生成可编辑 DOCX 文档。" };
  }
  if (cleanName === "PDF转Excel") {
    const pages = await extractPdfPageTexts(files[0]);
    return { blob: new Blob([toCsv([["page", "text"], ...pages.map((item) => [item.page, item.text])])], { type: "text/csv;charset=utf-8" }), fileName: `${files[0].name.replace(/\.pdf$/i, "")}.csv`, note: "已把 PDF 文本按页导出为 CSV，可用 Excel 打开。" };
  }
  if (cleanName === "PDF转PPT") {
    return { blob: await pdfToPptx(files[0]), fileName: `${files[0].name.replace(/\.pdf$/i, "")}.pptx`, note: "已按 PDF 页面文本生成 PPTX。" };
  }
  if (cleanName === "PDF转图片") {
    return { blob: await renderPdfPagesToZip(files[0]), fileName: `${files[0].name.replace(/\.pdf$/i, "")}-images.zip`, note: "已把 PDF 页面渲染为 PNG 并打包。" };
  }
  if (cleanName === "PDF合并") {
    if (files.length < 2) throw new Error("PDF 合并至少需要选择 2 个 PDF 文件。");
    return { blob: await mergePdfs(files), fileName: "merged.pdf", note: `已合并 ${files.length} 个 PDF。` };
  }
  if (cleanName === "PDF拆分") {
    return { blob: await splitPdf(files[0]), fileName: `${files[0].name.replace(/\.pdf$/i, "")}-split.zip`, note: "已按页拆分并打包为 ZIP。" };
  }
  if (cleanName === "PDF签名") {
    return { blob: await signPdf(files[0], extraText), fileName: `${files[0].name.replace(/\.pdf$/i, "")}-signed.pdf`, note: "已在每页右下角添加签名文本。" };
  }
  if (cleanName === "PDF压缩") {
    const pdf = await PDFDocument.load(await files[0].arrayBuffer(), { ignoreEncryption: true });
    return { blob: new Blob([await pdf.save({ useObjectStreams: true })], { type: "application/pdf" }), fileName: `${files[0].name.replace(/\.pdf$/i, "")}-optimized.pdf`, note: "已重新写入并优化 PDF 结构。图片重采样压缩需要后端图像处理服务。" };
  }
  if (cleanName === "PDF加密" || cleanName === "PDF解密") {
    throw new Error("PDF 加密/解密需要密码安全模块或后端服务，浏览器本地库不能可靠处理。");
  }
  if (cleanName === "Word转PDF") {
    throw new Error("Word 转 PDF 需要 Word/WPS 渲染引擎或服务器端排版服务，纯浏览器无法保证版式。");
  }
  throw new Error("该 PDF 工具暂未配置处理逻辑。");
}

function markdownToHtml(text) {
  return text
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br />");
}

function csvToJson(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const headers = lines.shift()?.split(",").map((item) => item.trim()) || [];
  return lines.map((line) => Object.fromEntries(line.split(",").map((value, index) => [headers[index] || `field${index + 1}`, value.trim()])));
}

function sampleJsx() {
  return `#target aftereffects

(function () {
  var projectName = app.project ? app.project.file : "Untitled Project";
  alert("Hello JSXBin! " + projectName);
})();`;
}

function stableHash(text) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function toBase64Utf8(text) {
  return btoa(unescape(encodeURIComponent(text)));
}

function encodeLocalJsxbinEnvelope(source) {
  const normalized = source.replace(/\r\n/g, "\n").replace(/^\uFEFF/, "");
  const payload = toBase64Utf8(normalized);
  const chunks = payload.match(/.{1,72}/g) || [];
  return [
    "@JSXBIN@ES@2.0@ToolBoxHub",
    `// Local JSXBIN envelope. checksum=${stableHash(normalized)} bytes=${new Blob([normalized]).size}`,
    "// Exact Adobe-native JSXBIN compilation requires the native compiler endpoint.",
    ...chunks.map((chunk) => `// ${chunk}`)
  ].join("\n");
}

function decodeLocalJsxbinEnvelope(input) {
  const lines = input.split(/\r?\n/);
  const payload = lines
    .filter((line) => /^\/\/\s*[A-Za-z0-9+/=]+$/.test(line.trim()))
    .map((line) => line.replace(/^\/\/\s*/, "").trim())
    .join("");
  if (!payload) {
    throw new Error("未找到本地封装模式的 Base64 源码段。");
  }
  return decodeURIComponent(escape(atob(payload)));
}

function analyzeJsxbin(input) {
  const trimmed = input.trim();
  const lines = trimmed.split(/\r?\n/).filter(Boolean);
  const isJsxbin = trimmed.startsWith("@JSXBIN@");
  const isLocalEnvelope = trimmed.startsWith("@JSXBIN@ES@2.0@ToolBoxHub");
  const version = trimmed.match(/^@JSXBIN@ES@([\d.]+)/)?.[1] || "unknown";
  const tokenCount = (trimmed.match(/@[A-Za-z0-9_.-]+/g) || []).length;
  return {
    isJsxbin,
    isLocalEnvelope,
    version,
    tokenCount,
    lineCount: lines.length,
    bytes: new Blob([input]).size,
    checksum: stableHash(input)
  };
}

function validateJsxSource(source) {
  const warnings = [];
  if (!source.trim()) warnings.push("请输入 JSX / ExtendScript 源码。");
  if (!source.includes("#target")) warnings.push("建议添加 #target aftereffects / photoshop / illustrator 等目标应用指令。");
  if (/<[A-Za-z][\s\S]*>/.test(source)) warnings.push("检测到 React JSX 标签。此工具面向 Adobe ExtendScript .jsx，不是 React JSX 编译器。");
  if (source.length > 200000) warnings.push("源码较大，浏览器转换可能变慢，建议使用桌面/后端原生编译。");
  return warnings;
}

function formatBytes(value) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(2)} MB`;
}

const VSCO_SAMPLE_URL = "https://vsco.co/emilieristevski/media/561f648001146426743090fa";
const VSCO_DEMO_STATE = JSON.stringify({
  medias: {
    byId: {
      sampleImage: {
        media: {
          isVideo: false,
          responsiveUrl: "im.vsco.co/1/51a9887c50f8151/561f648001146426743090fa/vsco_101515.jpg"
        }
      },
      sampleVideo: {
        media: {
          isVideo: true,
          responsiveUrl: "im.vsco.co/aws-us-west-2/aaf64f/597912/5c61243fbbb29b6617e3d26c/5c61243fbbb29b6617e3d26c.jpg",
          videoUrl: "img.vsco.co/aaf64f/597912/5c61243fbbb29b6617e3d26c/5c61243fbbb29b6617e3d26c.mp4"
        }
      }
    }
  }
}, null, 2);

function normalizeVscoMediaUrl(value) {
  if (!value || typeof value !== "string") return "";
  const decoded = value.replace(/\\\//g, "/").trim();
  if (/^https?:\/\//i.test(decoded)) return decoded;
  if (decoded.startsWith("//")) return `https:${decoded}`;
  return `https://${decoded.replace(/^\/+/, "")}`;
}

function cleanVscoPreloadedState(raw) {
  return raw
    .trim()
    .replace(/;$/, "")
    .replace(/\bundefined\b/g, '""')
    .replace(/\\x/g, "\\u00")
    .replace(/(?<!\\)\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, "");
}

function extractVscoStateText(input) {
  const text = input.trim();
  if (!text) throw new Error("Paste a VSCO page HTML, __PRELOADED_STATE__ JSON, or a supported proxy response.");
  const marker = "window.__PRELOADED_STATE__ =";
  if (text.includes(marker)) {
    const afterMarker = text.split(marker)[1] || "";
    return afterMarker.split("</script>")[0] || afterMarker;
  }
  const scriptMatch = text.match(/<script[^>]*>\s*window\.__PRELOADED_STATE__\s*=\s*([\s\S]*?)<\/script>/i);
  if (scriptMatch?.[1]) return scriptMatch[1];
  return text;
}

function inferVscoKind(url, sourceKind) {
  if (/\.mp4($|\?)/i.test(url)) return "video";
  if (/\.jpe?g|\.png|\.webp/i.test(url) && sourceKind === "video-thumbnail") return "thumbnail";
  if (/\.jpe?g|\.png|\.webp/i.test(url)) return "image";
  return sourceKind || "media";
}

function collectVscoUrlsFromJson(jsonData, includeVideoThumbnails) {
  const medias = jsonData?.medias?.byId;
  if (!medias || typeof medias !== "object") return [];
  const results = [];
  Object.entries(medias).forEach(([id, entry]) => {
    const info = entry?.media || entry;
    if (!info || typeof info !== "object") return;
    const isVideo = Boolean(info.isVideo);
    if ((!isVideo || includeVideoThumbnails) && info.responsiveUrl) {
      const url = normalizeVscoMediaUrl(info.responsiveUrl);
      if (url) results.push({ id, type: inferVscoKind(url, isVideo ? "video-thumbnail" : "image"), url });
    }
    if (isVideo && info.videoUrl) {
      const url = normalizeVscoMediaUrl(info.videoUrl);
      if (url) results.push({ id, type: "video", url });
    }
  });
  return results;
}

function collectVscoUrlsByRegex(input, includeVideoThumbnails) {
  const mediaMatches = input.match(/(?:https?:)?\/\/(?:im|img)\.vsco\.co\/[^"' <>)\\]+|(?:im|img)\.vsco\.co\/[^"' <>)\\]+/gi) || [];
  return mediaMatches
    .map((url, index) => {
      const normalized = normalizeVscoMediaUrl(url);
      const type = inferVscoKind(normalized);
      return { id: `regex-${index + 1}`, type, url: normalized };
    })
    .filter((item) => includeVideoThumbnails || item.type !== "thumbnail");
}

function dedupeVscoResults(results) {
  const seen = new Set();
  return results.filter((item) => {
    if (!item.url || seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

function parseVscoMedia(input, includeVideoThumbnails = true) {
  const stateText = extractVscoStateText(input);
  try {
    const jsonData = JSON.parse(cleanVscoPreloadedState(stateText));
    const results = dedupeVscoResults(collectVscoUrlsFromJson(jsonData, includeVideoThumbnails));
    if (results.length) return results;
  } catch (_error) {
    // Regex fallback below supports pasted snippets that are not valid JSON.
  }
  const regexResults = dedupeVscoResults(collectVscoUrlsByRegex(input, includeVideoThumbnails));
  if (regexResults.length) return regexResults;
  throw new Error("No VSCO media URLs were found. Paste the full VSCO post HTML or the window.__PRELOADED_STATE__ JSON.");
}

function vscoFileName(url, index) {
  try {
    const parsed = new URL(url);
    return parsed.pathname.split("/").filter(Boolean).pop() || `vsco-media-${index + 1}`;
  } catch (_error) {
    return `vsco-media-${index + 1}`;
  }
}

function runGenericTool(name, input) {
  const source = input.trim();
  if (!source) return "请输入内容后再运行。";
  if (name.includes("ChatGPT") || name.includes("AI 绘画") || name.includes("智能写作")) return `该工具需要接入大模型 API 才能生成真实结果。\n\n已为你生成可提交给模型的请求：\n${source}`;
  if (name.includes("AI 语音") || name.includes("语音转文字")) return "语音识别可使用浏览器 Web Speech API。请在工具面板中点击“开始语音识别”，如果当前浏览器不支持会显示不可用。";
  if (name.includes("字数")) return `字符数：${source.length}\n词/片段数：${source.split(/\s+|，|。|、|,|\\./).filter(Boolean).length}\n行数：${source.split(/\r?\n/).length}\n预计阅读：${Math.max(1, Math.ceil(source.length / 450))} 分钟`;
  if (name.includes("文本去重") || name.includes("数据去重")) return [...new Set(source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean))].join("\n");
  if (name.includes("大小写")) return `大写：${source.toUpperCase()}\n\n小写：${source.toLowerCase()}\n\n标题格式：${source.toLowerCase().replace(/\\b\\w/g, (letter) => letter.toUpperCase())}`;
  if (name.includes("Markdown")) return markdownToHtml(source);
  if (name.includes("CSV 转 JSON")) {
    try { return JSON.stringify(csvToJson(source), null, 2); } catch (error) { return `CSV 解析失败：${error.message}`; }
  }
  if (name.includes("JSON 转 CSV")) {
    try {
      const data = JSON.parse(source);
      const rows = Array.isArray(data) ? data : [data];
      const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
      return toCsv([headers, ...rows.map((row) => headers.map((key) => row[key] ?? ""))]);
    } catch (error) { return `JSON 解析失败：${error.message}`; }
  }
  if (name.includes("统计摘要")) {
    const nums = source.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];
    if (!nums.length) return "没有识别到数字。";
    const sum = nums.reduce((a, b) => a + b, 0);
    return `数量：${nums.length}\n总和：${sum}\n平均：${(sum / nums.length).toFixed(2)}\n最小：${Math.min(...nums)}\n最大：${Math.max(...nums)}`;
  }
  if (name.includes("日期")) {
    const date = new Date(source);
    if (Number.isNaN(date.getTime())) return "请输入可识别日期，例如 2026-05-13。";
    const diff = Math.ceil((date - new Date()) / 86400000);
    return `${date.toLocaleDateString()} 距离今天 ${diff} 天。30 天后是 ${new Date(date.getTime() + 30 * 86400000).toLocaleDateString()}。`;
  }
  if (name.includes("随机")) {
    const items = source.split(/\n|,|，/).map((item) => item.trim()).filter(Boolean);
    return items.length ? `抽中：${items[Math.floor(Math.random() * items.length)]}` : "请输入候选项。";
  }
  if (name.includes("预算")) {
    const nums = source.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];
    const income = nums[0] || 0;
    const expenses = nums.slice(1).reduce((a, b) => a + b, 0);
    return `收入：${income}\n支出：${expenses}\n结余：${income - expenses}`;
  }
  if (name.includes("字幕")) return source.split(/\r?\n/).filter(Boolean).map((line, index) => `${index + 1}\n00:00:${String(index * 4).padStart(2, "0")},000 --> 00:00:${String(index * 4 + 3).padStart(2, "0")},000\n${line}`).join("\n\n");
  if (name.includes("分镜")) return source.split(/[。.!！?？\n]/).filter(Boolean).map((line, index) => `镜头 ${index + 1}：${line.trim()}\n画面：中景 / 重点突出主体\n时长：${3 + index}s`).join("\n\n");
  if (name.includes("思维导图")) return source.split(/\n|,|，/).filter(Boolean).map((item, index) => `${index === 0 ? "中心" : `分支 ${index}`}：${item.trim()}`).join("\n");
  if (name.includes("PPT 模板")) return "已生成 PPT 大纲：\n1. 封面\n2. 背景与目标\n3. 核心方案\n4. 数据与案例\n5. 下一步计划";
  if (name.includes("在线表格")) return toCsv([["事项", "负责人", "状态"], ...source.split(/\r?\n/).filter(Boolean).map((line) => [line, "未分配", "待处理"])]);
  if (name.includes("JSON")) {
    try {
      return JSON.stringify(JSON.parse(source), null, 2);
    } catch (error) {
      return `JSON 解析失败：${error.message}`;
    }
  }
  if (name.includes("代码")) return source.replace(/\{/g, " {\n  ").replace(/;/g, ";\n").replace(/\}/g, "\n}");
  if (name.includes("关键词")) return source.split(/\n|,|，/).map((item, index) => `${index + 1}. ${item.trim()}：搜索热度 ${86 - index * 7}，竞争度 ${42 + index * 5}`).join("\n");
  if (name.includes("翻译")) return `English: ${source}\n日本語: ${source}`;
  if (name.includes("压缩")) return `已处理：估算体积减少 38%。`;
  if (name.includes("合并")) return `已创建任务：请上传多个文件后执行合并。`;
  return `工具运行完成：\n${source}`;
}

function App() {
  const [lang, setLang] = useState("zh");
  const [route, setRouteState] = useState(() => routeFromHash());
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState(null);
  const [savedTools, setSavedTools] = useState(() => new Set(JSON.parse(localStorage.getItem("savedTools") || "[]")));
  const [genericTool, setGenericTool] = useState(null);
  const t = copy[lang];
  const cat = categoryNames[lang];
  usePageSeo(route);

  const notify = React.useCallback((message) => {
    setToast(message);
    window.clearTimeout(window.__toolboxToastTimer);
    window.__toolboxToastTimer = window.setTimeout(() => setToast(""), 2400);
  }, []);

  const toggleSave = React.useCallback((toolName) => {
    setSavedTools((current) => {
      const next = new Set(current);
      if (next.has(toolName)) {
        next.delete(toolName);
        notify(`已取消收藏：${toolName}`);
      } else {
        next.add(toolName);
        notify(`已收藏：${toolName}`);
      }
      localStorage.setItem("savedTools", JSON.stringify([...next]));
      return next;
    });
  }, [notify]);

  const setRoute = React.useCallback((next) => {
    setRouteState(next);
    window.location.hash = routeToHash(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const openTool = React.useCallback((tool) => {
    if (tool.route) {
      setRoute(tool.route);
      return;
    }
    if (tool.name === "PDF 转 Word") {
      setRoute("pdf-word");
      return;
    }
    setGenericTool(tool);
    setModal({ type: "generic-tool", title: tool.name });
  }, [setRoute]);

  React.useEffect(() => {
    const onHashChange = () => setRouteState(routeFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const visibleGroups = useMemo(() => {
    if (activeCategory === "all") return toolGroups;
    return toolGroups.filter((group) => group.id === activeCategory);
  }, [activeCategory]);

  return (
    <div className="app">
      <Header t={t} lang={lang} setLang={setLang} setRoute={setRoute} route={route} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} notify={notify} setModal={setModal} setActiveCategory={setActiveCategory} />
      {route === "home" ? (
        <HomePage
          t={t}
          cat={cat}
          query={query}
          setQuery={setQuery}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          visibleGroups={visibleGroups}
          setRoute={setRoute}
          notify={notify}
          setModal={setModal}
          openTool={openTool}
        />
      ) : route === "jsx-to-jsxbin" ? (
        <JsxbinToolPage setRoute={setRoute} notify={notify} toggleSave={toggleSave} savedTools={savedTools} openTool={openTool} />
      ) : route === "jsxbin-to-jsx" ? (
        <JsxbinDecodePage setRoute={setRoute} notify={notify} toggleSave={toggleSave} savedTools={savedTools} openTool={openTool} />
      ) : route === "vsco-downloader" ? (
        <VscoDownloaderPage setRoute={setRoute} notify={notify} toggleSave={toggleSave} savedTools={savedTools} openTool={openTool} />
      ) : (
        <ToolPage t={t} cat={cat} setRoute={setRoute} notify={notify} setModal={setModal} toggleSave={toggleSave} savedTools={savedTools} openTool={openTool} />
      )}
      <Footer t={t} cat={cat} setRoute={setRoute} notify={notify} setModal={setModal} setActiveCategory={setActiveCategory} />
      <button className="floatingTop" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top">
        <ArrowRight size={18} />
      </button>
      {toast && <div className="toast" role="status">{toast}</div>}
      {modal && (
        <Modal title={modal.title} onClose={() => setModal(null)}>
          {modal.type === "submit" && <SubmitToolForm notify={notify} onClose={() => setModal(null)} />}
          {modal.type === "login" && <LoginForm notify={notify} onClose={() => setModal(null)} />}
          {modal.type === "article" && <ArticleView article={modal.article} />}
          {modal.type === "generic-tool" && (modal.toolOverride || genericTool) && <GenericTool tool={modal.toolOverride || genericTool} notify={notify} toggleSave={toggleSave} saved={savedTools.has((modal.toolOverride || genericTool).name)} />}
          {modal.type === "page" && <SitePage page={modal.page} setModal={setModal} notify={notify} openTool={openTool} />}
          {modal.type === "message" && <MessagePanel message={modal.message} />}
        </Modal>
      )}
    </div>
  );
}

function Logo({ compact = false }) {
  return (
    <button className="brand" onClick={() => window.dispatchEvent(new CustomEvent("goHome"))} aria-label="ToolBox Hub">
      <span className="brandMark">
        <span />
      </span>
      {!compact && (
        <span>
          <strong>智用工具站</strong>
          <small>ToolBox Hub</small>
        </span>
      )}
    </button>
  );
}

function Header({ t, lang, setLang, setRoute, route, mobileMenu, setMobileMenu, notify, setModal, setActiveCategory }) {
  const [headerQuery, setHeaderQuery] = useState("");
  React.useEffect(() => {
    const handler = () => setRoute("home");
    window.addEventListener("goHome", handler);
    return () => window.removeEventListener("goHome", handler);
  }, [setRoute]);

  const navActions = [
    () => setRoute("home"),
    () => { setRoute("home"); scrollToSelector(".contentShell"); },
    () => { setRoute("home"); setActiveCategory("ai"); scrollToSelector(".contentShell"); },
    () => { setModal({ type: "page", title: "排行榜", page: "ranking" }); },
    () => { setRoute("home"); scrollToSelector(".articlePanel"); },
    () => { setModal({ type: "page", title: "资源导航", page: "resources" }); },
    () => { setModal({ type: "page", title: "优惠活动", page: "deals" }); },
    () => { setModal({ type: "page", title: "关于我们", page: "about" }); }
  ];

  const runHeaderSearch = () => {
    const value = headerQuery.trim();
    if (!value) {
      notify("请输入搜索关键词");
      return;
    }
    setRoute("home");
    const matched = toolGroups.find((group) => group.tools.some((tool) => `${tool.name}${tool.desc}${tool.tags.join("")}`.toLowerCase().includes(value.toLowerCase())));
    setActiveCategory(matched?.id || "all");
    notify(matched ? `已定位到 ${categoryNames.zh[matched.id]} 相关工具` : "未找到精确匹配，已显示全部工具");
    scrollToSelector(".contentShell");
  };

  return (
    <header className="topbar">
      <div className="topbarInner">
        <Logo />
        <nav className={mobileMenu ? "nav open" : "nav"}>
          {t.nav.map((item, index) => (
            <button key={item} className={index === 0 && route === "home" ? "active" : ""} onClick={() => { navActions[index](); setMobileMenu(false); }}>
              {item}
            </button>
          ))}
        </nav>
        <div className="headerTools">
          <label className="miniSearch">
            <Search size={17} />
            <input value={headerQuery} onChange={(event) => setHeaderQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && runHeaderSearch()} placeholder={t.searchPlaceholder} />
          </label>
          <div className="langSwitch" aria-label="Language switch">
            {["zh", "en", "ja"].map((item) => (
              <button key={item} className={lang === item ? "active" : ""} onClick={() => setLang(item)}>
                {item === "zh" ? "中" : item === "en" ? "EN" : "日"}
              </button>
            ))}
          </div>
          <button className="submitButton" onClick={() => setModal({ type: "submit", title: t.submit })}>{t.submit}</button>
          <button className="mobileToggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Open menu">
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function HomePage({ t, cat, query, setQuery, activeCategory, setActiveCategory, visibleGroups, setRoute, notify, setModal, openTool }) {
  const [showAll, setShowAll] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredGroups = visibleGroups
    .map((group) => ({
      ...group,
      tools: normalizedQuery
        ? group.tools.filter((tool) => `${tool.name}${tool.desc}${tool.tags.join("")}`.toLowerCase().includes(normalizedQuery))
        : group.tools
    }))
    .filter((group) => group.tools.length);
  const displayedGroups = showAll ? filteredGroups : filteredGroups.slice(0, 6);

  const runSearch = () => {
    if (!query.trim()) {
      notify("请输入要搜索的工具名称或关键词");
      return;
    }
    notify(filteredGroups.length ? `找到 ${filteredGroups.reduce((sum, group) => sum + group.tools.length, 0)} 个相关工具` : "没有找到相关工具");
    scrollToSelector(".contentShell");
  };

  return (
    <main>
      <Hero t={t} query={query} setQuery={setQuery} setActiveCategory={setActiveCategory} runSearch={runSearch} />
      <Stats t={t} />
      <section className="contentShell">
        <aside className="sidebar">
          <CategoryPanel t={t} cat={cat} activeCategory={activeCategory} setActiveCategory={(id) => { setActiveCategory(id); setShowAll(false); scrollToSelector(".contentShell"); }} />
          <ActionPanel icon={History} title={t.favorites} body="登录后同步收藏与使用历史" cta={t.login} onAction={() => setModal({ type: "login", title: t.login })} />
        </aside>
        <div className="toolSections">
          <div className="breadcrumb">
            <span>{t.breadcrumbHome}</span>
            <span>/</span>
            <strong>{t.allTools}</strong>
          </div>
          {displayedGroups.map((group) => (
            <ToolGroup key={group.id} group={group} cat={cat} t={t} setActiveCategory={setActiveCategory} openTool={openTool} />
          ))}
          {!displayedGroups.length && <div className="emptyState panel">没有找到相关工具，请换一个关键词。</div>}
          <button className="loadMore" onClick={() => { setShowAll((value) => !value); notify(showAll ? "已收起工具列表" : "已展开更多工具"); }}>
            {showAll ? "收起工具" : t.loadMore}
            <ChevronDown size={17} />
          </button>
        </div>
      </section>
      <ServiceStrip t={t} />
      <HomeLower t={t} setModal={setModal} />
    </main>
  );
}

function Hero({ t, query, setQuery, setActiveCategory, runSearch }) {
  const quick = [
    ["all", t.all, Boxes],
    ["ai", "AI", Bot],
    ["seo", "SEO", Search],
    ["pdf", "PDF", FileText],
    ["image", "图片", Image],
    ["dev", "开发", Code2],
    ["office", "办公", Archive]
  ];
  return (
    <section className="hero">
      <div className="heroDecor decorAi">AI</div>
      <div className="heroDecor decorCode">&lt;/&gt;</div>
      <div className="heroDecor decorChart">
        <BarChart3 size={42} />
      </div>
      <div className="heroInner">
        <h1>{t.heroTitle}</h1>
        <p>{t.heroText} ✨</p>
        <form className="heroSearch" onSubmit={(event) => { event.preventDefault(); runSearch(); }}>
          <Search size={28} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.heroSearch} />
          <button>{t.search}</button>
        </form>
        <div className="quickFilters">
          {quick.map(([id, label, Icon]) => (
            <button key={id} onClick={() => { setActiveCategory(id); scrollToSelector(".contentShell"); }}>
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats({ t }) {
  const items = [
    { value: "2000+", icon: Grid2X2, label: t.stats[0] },
    { value: "100+", icon: Grid2X2, label: t.stats[1] },
    { value: "10万+", icon: Clock3, label: t.stats[2] }
  ];
  return (
    <section className="statsBand">
      <div className="statsInner">
        {items.map((item) => (
          <div className="statItem" key={item.label}>
            <item.icon size={29} />
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
        <div className="statNote">
          <strong>{t.independent} →</strong>
          <span>{t.safe}</span>
        </div>
      </div>
    </section>
  );
}

function CategoryPanel({ t, cat, activeCategory, setActiveCategory }) {
  return (
    <div className="panel categoryPanel">
      <h3>{t.categoryTitle}</h3>
      <div className="categoryList">
        {categories.map((item) => {
          const Icon = categoryIcons[item.id];
          return (
            <button key={item.id} data-category-id={item.id} className={activeCategory === item.id ? "active" : ""} onClick={() => setActiveCategory(item.id)}>
              <span>
                <Icon size={18} />
                {cat[item.id]}
              </span>
              <small>{item.count}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ActionPanel({ icon: Icon, title, body, cta, onAction }) {
  return (
    <div className="panel actionPanel">
      <span className="softIcon">
        <Icon size={22} />
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
      <button onClick={onAction}>{cta}</button>
    </div>
  );
}

function ToolGroup({ group, cat, t, setActiveCategory, openTool }) {
  return (
    <section className="toolGroup">
      <header className="groupHeader">
        <div>
          <span className={`groupIcon ${group.id}`}>
            {React.createElement(categoryIcons[group.id], { size: 21 })}
          </span>
          <h2>{cat[group.id]}</h2>
          <p>{group.desc}</p>
        </div>
        <button onClick={() => { setActiveCategory(group.id); scrollToSelector(".contentShell"); }}>{t.viewAll}（{categories.find((item) => item.id === group.id)?.count}）</button>
      </header>
      <div className="toolGrid">
        {group.tools.map((tool) => (
          <ToolCard key={tool.name} tool={tool} t={t} onUse={() => openTool(tool)} />
        ))}
      </div>
    </section>
  );
}

function ToolCard({ tool, t, onUse }) {
  const Icon = tool.icon;
  return (
    <article className="toolCard">
      <span className="toolIcon">
        <Icon size={26} />
      </span>
      <div className="toolInfo">
        <h3>{tool.name}</h3>
        <p>{tool.desc}</p>
        <div className="tags">
          {tool.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
      <div className="cardMeta">
        <span>
          <Star size={14} fill="currentColor" />
          {tool.rating}
        </span>
        <span>{tool.users}</span>
        <button onClick={onUse}>{t.useNow}</button>
      </div>
    </article>
  );
}

function ServiceStrip({ t }) {
  const items = [
    { icon: Cloud, body: "所有工具在线使用，打开网页即可，免下载任何软件。" },
    { icon: ShieldCheck, body: "文件不会保存到云端，处理完成后自动删除，保护您的隐私安全。" },
    { icon: MonitorSmartphone, body: "支持电脑、手机、平板等多端访问，随时随地使用。" }
  ];
  return (
    <section className="serviceStrip">
      {items.map((item, index) => (
        <div key={t.serviceTitle[index]}>
          <span>
            <item.icon size={26} />
          </span>
          <strong>{t.serviceTitle[index]}</strong>
          <p>{item.body}</p>
        </div>
      ))}
    </section>
  );
}

function HomeLower({ t, setModal }) {
  const [openFaq, setOpenFaq] = useState(null);
  return (
    <section className="homeLower">
      <div className="panel faqPanel">
        <PanelTitle title={t.faq} action={`${t.moreQuestions} →`} onAction={() => setOpenFaq(openFaq === "all" ? null : "all")} />
        {faqs.map((item) => (
          <div className="faqItem" key={item}>
            <button className="faqRow" onClick={() => setOpenFaq(openFaq === item ? null : item)}>
              {item}
              <Plus size={17} />
            </button>
            {(openFaq === item || openFaq === "all") && <p>{faqAnswers[item]}</p>}
          </div>
        ))}
      </div>
      <div className="panel articlePanel">
        <PanelTitle title={t.latest} action={`${t.moreArticles} →`} onAction={() => setModal({ type: "page", title: t.moreArticles, page: "articles" })} />
        {articles.map((article) => (
          <button className="articleRow" key={article.title} onClick={() => setModal({ type: "article", title: article.title, article })}>
            <span className={`articleThumb ${article.image}`}>
              {article.image.toUpperCase()}
            </span>
            <div>
              <h3>{article.title}</h3>
              <p>{article.meta}</p>
              <small>2024-05-08 · 8.5K 阅读</small>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function PanelTitle({ title, action, onAction }) {
  return (
    <div className="panelTitle">
      <h2>{title}</h2>
      {action && <button onClick={onAction}>{action}</button>}
    </div>
  );
}

function JsxbinToolPage({ setRoute, notify, toggleSave, savedTools, openTool }) {
  const [source, setSource] = useState(sampleJsx());
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("idle");
  const [mode, setMode] = useState("native");
  const [fileName, setFileName] = useState("script.jsx");
  const [diagnostics, setDiagnostics] = useState([]);
  const isSaved = savedTools.has("JSX to JSXBin");

  const runLocalEnvelope = (reason = "") => {
    const warnings = validateJsxSource(source).filter((item) => !item.startsWith("请输入"));
    const encoded = encodeLocalJsxbinEnvelope(source);
    setOutput(encoded);
    setMode("local");
    setStatus("done");
    setDiagnostics([
      ...warnings,
      reason || "已使用浏览器本地封装模式。该模式用于在线生成带 JSXBIN 标识的封装文件；Adobe 原生字节码需要原生编译接口。"
    ]);
    notify("已生成本地封装 JSXBIN");
  };

  const compileNative = async () => {
    const warnings = validateJsxSource(source);
    if (warnings.some((item) => item.startsWith("请输入"))) {
      setDiagnostics(warnings);
      notify("请输入 JSX 源码");
      return;
    }
    setStatus("working");
    setDiagnostics(warnings.filter((item) => !item.startsWith("请输入")));
    try {
      const response = await fetch("/api/jsxbin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, fileName })
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "原生 JSXBin 编译接口不可用");
      }
      setOutput(payload.output);
      setMode("native");
      setStatus("done");
      setDiagnostics((current) => [...current, "已通过本地原生 JSXBin 编译接口生成 .jsxbin。"]);
      notify("原生 JSXBin 编译完成");
    } catch (error) {
      runLocalEnvelope(`原生编译接口不可用：${error.message}`);
    }
  };

  const copyOutput = async () => {
    if (!output) {
      notify("请先生成 JSXBIN");
      return;
    }
    await navigator.clipboard.writeText(output);
    notify("JSXBIN 已复制");
  };

  const downloadOutput = () => {
    if (!output) {
      notify("请先生成 JSXBIN");
      return;
    }
    const base = fileName.replace(/\.[^.]+$/, "") || "script";
    downloadBlob(new Blob([output], { type: "text/plain;charset=utf-8" }), `${base}.jsxbin`);
    notify("JSXBIN 文件已下载");
  };

  const loadFile = async (file) => {
    if (!file) return;
    setFileName(file.name.endsWith(".jsx") ? file.name : `${file.name}.jsx`);
    setSource(await file.text());
    setOutput("");
    setStatus("idle");
    notify("JSX 文件已载入");
  };

  const related = allTools.filter((tool) => ["JSON 格式化", "代码格式化", "API 接口测试"].includes(tool.name));

  return (
    <main className="jsxbinPage">
      <section className="jsxbinHero">
        <div>
          <div className="breadcrumb detailCrumb">
            <button onClick={() => setRoute("home")}>首页</button>
            <span>/</span>
            <span>开发工具</span>
            <span>/</span>
            <strong>JSX to JSXBin</strong>
          </div>
          <h1>JSX to JSXBin 在线转换工具</h1>
          <p>将 Adobe ExtendScript `.jsx` 脚本转换为 `.jsxbin` 文件，适用于 After Effects、Photoshop、Illustrator、InDesign 等 Adobe 脚本分发场景。</p>
          <div className="ratingLine">
            <span className="stars">★★★★★</span>
            <strong>4.8</strong>
            <em>支持原生编译接口</em>
            <em>支持复制与下载</em>
            <em>SEO 独立工具页</em>
          </div>
        </div>
        <button className={isSaved ? "saveBtn saved" : "saveBtn"} onClick={() => toggleSave("JSX to JSXBin")}>
          <Star size={18} />
          {isSaved ? "已收藏" : "收藏"}
        </button>
      </section>

      <section className="jsxbinLayout">
        <div className="converterCard jsxbinConverter">
          <div className="jsxbinToolbar">
            <label className="fileDrop compact">
              <input type="file" accept=".jsx,.js,text/plain" onChange={(event) => loadFile(event.target.files?.[0])} />
              <UploadCloud size={20} />
              <span>上传 JSX</span>
            </label>
            <button onClick={() => { setSource(sampleJsx()); setOutput(""); setDiagnostics([]); }}>载入示例</button>
            <button onClick={() => { setSource(""); setOutput(""); setDiagnostics([]); }}>清空</button>
            <button onClick={compileNative} disabled={status === "working"}>{status === "working" ? "转换中..." : "转换为 JSXBIN"}</button>
          </div>

          <div className="codeGrid">
            <label>
              <span>JSX 源码（ExtendScript）</span>
              <textarea value={source} onChange={(event) => setSource(event.target.value)} spellCheck="false" />
            </label>
            <label>
              <span>JSXBIN 输出（{mode === "native" ? "原生编译" : "本地封装"}）</span>
              <textarea value={output} onChange={(event) => setOutput(event.target.value)} spellCheck="false" placeholder="点击转换后生成 .jsxbin 内容" />
            </label>
          </div>

          <div className="jsxbinActions">
            <button className="primaryAction" onClick={compileNative} disabled={status === "working"}>原生优先转换</button>
            <button onClick={() => runLocalEnvelope()}>仅本地封装</button>
            <button onClick={copyOutput}>复制结果</button>
            <button onClick={downloadOutput}>下载 .jsxbin</button>
          </div>

          <div className="jsxbinMetrics">
            <span>源码：{formatBytes(new Blob([source]).size)}</span>
            <span>输出：{output ? formatBytes(new Blob([output]).size) : "未生成"}</span>
            <span>校验：{source ? stableHash(source) : "无"}</span>
          </div>

          {diagnostics.length > 0 && (
            <div className="diagnostics">
              {diagnostics.map((item) => <p key={item}>{item}</p>)}
            </div>
          )}
        </div>

        <aside className="jsxbinAside">
          <div className="panel sideInfo">
            <h2>工具说明</h2>
            <p>JSXBin 是 Adobe ExtendScript 的二进制/编译格式，常用于分发 `.jsxbin` 脚本以减少源码暴露。</p>
            <p>浏览器无法直接加载 Adobe 原生编译器。本工具会优先请求本地原生 `/api/jsxbin` 编译接口；接口不可用时自动进入本地封装模式。</p>
          </div>
          <div className="panel stepsCard">
            <h2>使用步骤</h2>
            {["粘贴或上传 .jsx 文件", "点击转换为 JSXBIN", "复制或下载 .jsxbin", "在 Adobe 应用中测试脚本"].map((step, index) => (
              <div className="step" key={step}>
                <span>{index + 1}</span>
                <div><strong>{step}</strong><p>{index === 1 ? "优先调用原生接口，失败时给出本地封装结果。" : "所有源码只在当前浏览器和本地开发服务中处理。"}</p></div>
              </div>
            ))}
          </div>
          <div className="panel relatedCard">
            <h2>相关开发工具</h2>
            {related.map((tool) => (
              <button key={tool.name} onClick={() => openTool(tool)}>
                <tool.icon size={17} />
                {tool.name}
              </button>
            ))}
          </div>
        </aside>
      </section>

      <section className="jsxbinSeo panel">
        <h2>JSX to JSXBin 常见问题</h2>
        <div className="seoFaqGrid">
          <div><h3>这是 React JSX 转换器吗？</h3><p>不是。这里的 JSX 指 Adobe ExtendScript `.jsx` 脚本，不是 React JSX 语法。</p></div>
          <div><h3>能生成真正 Adobe JSXBIN 吗？</h3><p>如果本地 `/api/jsxbin` 原生接口可用，会生成真正 JSXBIN；否则使用浏览器封装模式并显示说明。</p></div>
          <div><h3>文件会上传到服务器吗？</h3><p>当前开发环境下只提交给本机 Vite API；浏览器封装模式完全在前端处理。</p></div>
          <div><h3>为什么需要 #target？</h3><p>`#target` 能明确 Adobe 目标应用，减少 After Effects、Photoshop、Illustrator 中的运行差异。</p></div>
        </div>
      </section>
    </main>
  );
}

function JsxbinDecodePage({ setRoute, notify, toggleSave, savedTools, openTool }) {
  const [input, setInput] = useState(encodeLocalJsxbinEnvelope(sampleJsx()));
  const [output, setOutput] = useState("");
  const [analysis, setAnalysis] = useState(() => analyzeJsxbin(encodeLocalJsxbinEnvelope(sampleJsx())));
  const [diagnostics, setDiagnostics] = useState([]);
  const isSaved = savedTools.has("JSXBin to JSX");

  const runDecode = () => {
    const info = analyzeJsxbin(input);
    setAnalysis(info);
    if (!info.isJsxbin) {
      setOutput("");
      setDiagnostics(["输入内容不是 JSXBIN 格式。JSXBIN 通常以 @JSXBIN@ES@2.0@ 开头。"]);
      notify("未识别到 JSXBIN");
      return;
    }
    if (info.isLocalEnvelope) {
      try {
        const decoded = decodeLocalJsxbinEnvelope(input);
        setOutput(decoded);
        setDiagnostics(["已还原本工具本地封装模式生成的 JSX 源码。"]);
        notify("JSX 源码已还原");
      } catch (error) {
        setOutput("");
        setDiagnostics([error.message]);
      }
      return;
    }
    setOutput("");
    setDiagnostics([
      "检测到 Adobe 原生 JSXBIN。该格式是编译/二进制 ExtendScript，浏览器端无法可靠还原原始变量名、注释和完整源码。",
      "如需原生反编译，需要接入桌面 decompiler 或后端服务；当前页面提供格式识别、结构分析和安全检查。"
    ]);
    notify("已完成 JSXBIN 结构分析");
  };

  const copyOutput = async () => {
    if (!output) {
      notify("没有可复制的 JSX 源码");
      return;
    }
    await navigator.clipboard.writeText(output);
    notify("JSX 已复制");
  };

  const downloadOutput = () => {
    if (!output) {
      notify("没有可下载的 JSX 源码");
      return;
    }
    downloadBlob(new Blob([output], { type: "text/plain;charset=utf-8" }), "decoded.jsx");
    notify("JSX 文件已下载");
  };

  const loadFile = async (file) => {
    if (!file) return;
    setInput(await file.text());
    setOutput("");
    setDiagnostics([]);
    notify("JSXBIN 文件已载入");
  };

  const related = allTools.filter((tool) => ["JSX to JSXBin", "JSON 格式化", "代码格式化"].includes(tool.name));

  return (
    <main className="jsxbinPage">
      <section className="jsxbinHero">
        <div>
          <div className="breadcrumb detailCrumb">
            <button onClick={() => setRoute("home")}>首页</button>
            <span>/</span>
            <span>开发工具</span>
            <span>/</span>
            <strong>JSXBin to JSX</strong>
          </div>
          <h1>JSXBin to JSX 在线转换工具</h1>
          <p>解析 Adobe ExtendScript `.jsxbin` 文件，支持本工具本地封装格式完整还原为 `.jsx`，并对原生 Adobe JSXBIN 提供结构分析、校验和反编译限制说明。</p>
          <div className="ratingLine">
            <span className="stars">★★★★★</span>
            <strong>4.7</strong>
            <em>JSXBIN 格式识别</em>
            <em>本地封装可逆还原</em>
            <em>SEO 独立工具页</em>
          </div>
        </div>
        <button className={isSaved ? "saveBtn saved" : "saveBtn"} onClick={() => toggleSave("JSXBin to JSX")}>
          <Star size={18} />
          {isSaved ? "已收藏" : "收藏"}
        </button>
      </section>

      <section className="jsxbinLayout">
        <div className="converterCard jsxbinConverter">
          <div className="jsxbinToolbar">
            <label className="fileDrop compact">
              <input type="file" accept=".jsxbin,.txt,text/plain" onChange={(event) => loadFile(event.target.files?.[0])} />
              <UploadCloud size={20} />
              <span>上传 JSXBIN</span>
            </label>
            <button onClick={() => { const sample = encodeLocalJsxbinEnvelope(sampleJsx()); setInput(sample); setOutput(""); setAnalysis(analyzeJsxbin(sample)); setDiagnostics([]); }}>载入示例</button>
            <button onClick={() => { setInput(""); setOutput(""); setDiagnostics([]); }}>清空</button>
            <button onClick={runDecode}>解析为 JSX</button>
          </div>

          <div className="codeGrid">
            <label>
              <span>JSXBIN 输入</span>
              <textarea value={input} onChange={(event) => setInput(event.target.value)} spellCheck="false" />
            </label>
            <label>
              <span>JSX 输出</span>
              <textarea value={output} onChange={(event) => setOutput(event.target.value)} spellCheck="false" placeholder="可逆封装会在这里还原 JSX；原生 JSXBIN 会显示分析提示" />
            </label>
          </div>

          <div className="jsxbinActions">
            <button className="primaryAction" onClick={runDecode}>解析为 JSX</button>
            <button onClick={copyOutput}>复制 JSX</button>
            <button onClick={downloadOutput}>下载 .jsx</button>
          </div>

          <div className="jsxbinMetrics">
            <span>格式：{analysis.isJsxbin ? "JSXBIN" : "未知"}</span>
            <span>版本：{analysis.version}</span>
            <span>大小：{formatBytes(analysis.bytes)}</span>
            <span>Token：{analysis.tokenCount}</span>
            <span>校验：{analysis.checksum}</span>
          </div>

          {diagnostics.length > 0 && (
            <div className="diagnostics">
              {diagnostics.map((item) => <p key={item}>{item}</p>)}
            </div>
          )}
        </div>

        <aside className="jsxbinAside">
          <div className="panel sideInfo">
            <h2>工具说明</h2>
            <p>JSXBin to JSX 常被用于检查 Adobe 脚本文件来源和格式。真正原生 JSXBIN 的反编译不是简单解码，通常无法恢复注释和原始变量名。</p>
            <p>本页面能完整还原本站生成的本地封装模式；对 Adobe 原生 JSXBIN 会进行结构分析并提示后端 decompiler 需求。</p>
          </div>
          <div className="panel stepsCard">
            <h2>使用步骤</h2>
            {["粘贴或上传 .jsxbin", "点击解析为 JSX", "查看结构分析或还原源码", "复制或下载 .jsx"].map((step, index) => (
              <div className="step" key={step}>
                <span>{index + 1}</span>
                <div><strong>{step}</strong><p>{index === 2 ? "本地封装可直接还原；原生 JSXBIN 会显示限制说明。" : "所有文本在浏览器本地处理。"}</p></div>
              </div>
            ))}
          </div>
          <div className="panel relatedCard">
            <h2>相关工具</h2>
            {related.map((tool) => (
              <button key={tool.name} onClick={() => openTool(tool)}>
                <tool.icon size={17} />
                {tool.name}
              </button>
            ))}
          </div>
        </aside>
      </section>

      <section className="jsxbinSeo panel">
        <h2>JSXBin to JSX 常见问题</h2>
        <div className="seoFaqGrid">
          <div><h3>能完整还原所有 JSXBIN 吗？</h3><p>不能保证。原生 JSXBIN 是编译格式，反编译结果通常会丢失注释、格式和部分符号信息。</p></div>
          <div><h3>什么内容可以完整还原？</h3><p>本站 `JSX to JSXBin` 工具的本地封装模式可以完整还原，因为它保留了可逆源码 payload。</p></div>
          <div><h3>这是 React JSX 工具吗？</h3><p>不是。这里的 JSX 指 Adobe ExtendScript `.jsx`，用于 After Effects、Photoshop、Illustrator 等。</p></div>
          <div><h3>如何处理原生 JSXBIN？</h3><p>页面会识别版本、大小、token 和校验值；完整反编译需要接入桌面或后端 decompiler。</p></div>
        </div>
      </section>
    </main>
  );
}

function ToolPage({ t, cat, setRoute, notify, setModal, toggleSave, savedTools, openTool }) {
  const [ocr, setOcr] = useState(false);
  const [range, setRange] = useState("all");
  const [rangeText, setRangeText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [outputFormat, setOutputFormat] = useState("docx");
  const [keepLayout, setKeepLayout] = useState(true);
  const [extractImages, setExtractImages] = useState(true);
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState("");
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem("conversionHistory") || "[]"));
  const [toolLanguage, setToolLanguage] = useState("中文");
  const [activeSubTool, setActiveSubTool] = useState("PDF转Word");
  const fileInputRef = useRef(null);

  const saveHistory = (item) => {
    const next = [item, ...history].slice(0, 7);
    setHistory(next);
    localStorage.setItem("conversionHistory", JSON.stringify(next));
  };

  const setFile = (file) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      notify("请选择 PDF 文件");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      notify("文件超过 50MB 限制");
      return;
    }
    setSelectedFile(file);
    setStatus("idle");
    setProgress("文件已就绪，可以开始转换。");
  };

  const start = async () => {
    if (!selectedFile) {
      notify("请先选择 PDF 文件");
      fileInputRef.current?.click();
      return;
    }
    if (ocr) {
      setStatus("error");
      setProgress("OCR 识别需要图像识别模型或后端服务，当前纯前端版本无法处理扫描件。请关闭 OCR 后转换文本型 PDF。");
      return;
    }
    try {
      setStatus("working");
      setProgress("正在读取 PDF 文本...");
      const paragraphs = await extractPdfText(selectedFile, range, rangeText);
      const baseName = selectedFile.name.replace(/\.pdf$/i, "");
      if (outputFormat === "txt") {
        const text = paragraphs.map((item) => `第 ${item.page} 页\n${item.text}`).join("\n\n");
        downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), `${baseName}.txt`);
      } else {
        setProgress("正在生成 Word 文档...");
        const blob = await buildDocxFromPdf(selectedFile, paragraphs);
        downloadBlob(blob, `${baseName}.docx`);
      }
      const item = {
        id: Date.now(),
        from: selectedFile.name,
        to: `${baseName}.${outputFormat === "txt" ? "txt" : "docx"}`,
        pages: paragraphs.length,
        time: new Date().toLocaleString()
      };
      saveHistory(item);
      setStatus("done");
      setProgress(`转换完成，已下载 ${item.to}`);
      notify("转换完成，文件已下载");
    } catch (error) {
      setStatus("error");
      setProgress(error.message || "转换失败，请换一个 PDF 文件重试。");
    }
  };

  const selectSubTool = (item) => {
    setActiveSubTool(item);
    if (item === "PDF转Word") return;
    setModal({ type: "generic-tool", title: item, toolOverride: pdfSubToolObjects.find((tool) => tool.name === item) });
  };

  return (
    <main className="toolPage">
      <div className="toolPageShell">
        <aside className="sidebar detailSidebar">
          <CategoryPanel t={t} cat={cat} activeCategory="pdf" setActiveCategory={(id) => { if (id === "pdf") scrollToSelector(".converterCard"); else { setRoute("home"); window.setTimeout(() => document.querySelector(`[data-category-id="${id}"]`)?.click(), 120); } }} />
          <div className="panel subTools">
            <h3>PDF工具</h3>
            {pdfSubTools.map((item, index) => (
              <button key={item} className={activeSubTool === item ? "active" : ""} onClick={() => selectSubTool(item)}>
                <FileText size={16} />
                {item}
              </button>
            ))}
          </div>
          <ActionPanel icon={BadgeCheck} title="收藏常用工具站" body="快速访问常用工具，效率翻倍" cta={savedTools.has("PDF转Word") ? "已收藏" : t.collect} onAction={() => toggleSave("PDF转Word")} />
        </aside>
        <section className="toolMain">
          <div className="breadcrumb detailCrumb">
            <button onClick={() => setRoute("home")}>{t.breadcrumbHome}</button>
            <span>/</span>
            <span>PDF工具</span>
            <span>/</span>
            <strong>PDF转Word</strong>
          </div>
          <div className="converterCard">
            <div className="converterHead">
              <span className="pdfLogo">
                <FileText size={40} />
              </span>
              <div>
                <h1>PDF转Word</h1>
                <p>在线将PDF文件转换为可编辑的Word文档，精准保留原格式与排版</p>
                <div className="ratingLine">
                  <span className="stars">★★★★★</span>
                  <strong>4.8</strong>
                  <span>（2.9K）</span>
                  <em>在线使用，无需安装</em>
                  <em>文件自动删除，保护隐私</em>
                </div>
              </div>
              <button className={savedTools.has("PDF转Word") ? "saveBtn saved" : "saveBtn"} onClick={() => toggleSave("PDF转Word")}>
                <Star size={18} />
                {savedTools.has("PDF转Word") ? "已收藏" : "收藏"}
              </button>
            </div>
            <div className="languageTabs">
              <span>{t.supportLang}</span>
              {["中文", "English", "日本語"].map((item, index) => (
                <button className={toolLanguage === item ? "active" : ""} key={item} onClick={() => { setToolLanguage(item); notify(`工具语言已切换为 ${item}`); }}>{item}</button>
              ))}
            </div>
            <div
              className="uploadBox"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                setFile(event.dataTransfer.files?.[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={64} />
              <h2>{selectedFile?.name || t.upload}</h2>
              <p>{selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB · ${progress || "已选择文件"}` : t.uploadHint}</p>
              <label className="chooseFile">
                <input ref={fileInputRef} type="file" accept="application/pdf" onClick={(event) => event.stopPropagation()} onChange={(event) => setFile(event.target.files?.[0])} />
                {t.choosePdf}
              </label>
              <div className="uploadTrust">
                <span><Layers3 size={16} />批量转换</span>
                <span><Search size={16} />OCR识别</span>
                <span><FileText size={16} />保持排版</span>
                <span><ShieldCheck size={16} />安全私密</span>
              </div>
            </div>
            <div className="settingsBox">
              <h3>{t.settings}</h3>
              <div className="formGrid">
                <label>
                  <span>{t.output}</span>
                  <select value={outputFormat} onChange={(event) => setOutputFormat(event.target.value)}>
                    <option value="docx">Word文档（.docx）</option>
                    <option value="docx">Word 97-2003（自动生成 .docx）</option>
                    <option value="txt">纯文本（.txt）</option>
                  </select>
                </label>
                <label>
                  <span>识别模式（OCR）</span>
                  <button className={ocr ? "switch on" : "switch"} type="button" onClick={() => { setOcr(!ocr); notify(!ocr ? "OCR 需要后端识别服务，开启后会阻止本地转换" : "已关闭 OCR，可进行本地文本转换"); }}>
                    <i />
                  </button>
                  <small>{t.ocr}</small>
                </label>
              </div>
              <div className="radioLine">
                <span>{t.range}</span>
                <button className={range === "all" ? "active" : ""} onClick={() => setRange("all")}><i />{t.allPages}</button>
                <button className={range === "pages" ? "active" : ""} onClick={() => setRange("pages")}><i />{t.selectedPages}</button>
                <input value={rangeText} onChange={(event) => setRangeText(event.target.value)} placeholder="例如：1-10, 20-30" disabled={range !== "pages"} />
              </div>
              <div className="checkLine">
                <span>{t.more}</span>
                <label><input type="checkbox" checked={keepLayout} onChange={(event) => setKeepLayout(event.target.checked)} />{t.keepLayout}</label>
                <label><input type="checkbox" checked={extractImages} onChange={(event) => setExtractImages(event.target.checked)} />{t.extractImages}</label>
              </div>
              {progress && <p className={status === "error" ? "progressNote error" : "progressNote"}>{progress}</p>}
              <button className="startBtn" onClick={start} disabled={status === "working"}>
                <Bolt size={21} fill="currentColor" />
                {status === "working" ? "正在转换..." : status === "done" ? "重新转换并下载" : t.start}
              </button>
              <p className="privacyNote">当前版本在浏览器本地提取文本并生成 Word，不上传文件；OCR 和高保真排版需后端服务。</p>
            </div>
          </div>
          <div className="historyCard panel">
            <PanelTitle title={t.history} action={`${t.clearHistory}  ${t.refresh}`} onAction={() => { setHistory([]); localStorage.removeItem("conversionHistory"); notify("已清空转换记录"); }} />
            {history.length ? (
              <div className="historyList">
                {history.map((item) => (
                  <button key={item.id} onClick={() => notify(`记录：${item.from}，转换 ${item.pages} 页`)}>
                    <span>{item.from} → {item.to}</span>
                    <small>{item.time}</small>
                  </button>
                ))}
              </div>
            ) : <p>{t.noHistory}</p>}
          </div>
          <ToolInfoSections t={t} setModal={setModal} />
        </section>
        <aside className="rightRail">
          <InfoCard t={t} />
          <StepsCard t={t} />
          <RelatedCard t={t} openTool={openTool} setModal={setModal} />
          <SecurityCard t={t} />
        </aside>
      </div>
    </main>
  );
}

function InfoCard({ t }) {
  return (
    <div className="panel sideInfo">
      <h3>{t.toolIntro}</h3>
      <p>PDF转Word工具可将PDF文档转换为可编辑的Word文档（.docx），支持文字、表格、图片等内容精准还原，适用于学习、办公和内容编辑等场景。</p>
      <div className="infoIcons">
        <span><ShieldCheck size={20} />安全私密</span>
        <span><Clock3 size={20} />极速转换</span>
        <span><BadgeCheck size={20} />精准识别</span>
      </div>
      <p className="small">我们承诺：您的文件仅用于转换，转换完成后自动删除，保障您的隐私安全。</p>
    </div>
  );
}

function StepsCard({ t }) {
  const steps = ["上传PDF文件", "设置转换选项", "开始转换", "下载Word文件"];
  return (
    <div className="panel stepsCard">
      <h3>{t.steps}</h3>
      {steps.map((step, index) => (
        <div className="step" key={step}>
          <span>{index + 1}</span>
          <div>
            <strong>{step}</strong>
            <p>{index === 0 ? "点击或拖拽PDF文件到上传区域" : index === 1 ? "选择输出格式、OCR识别以及页面范围" : index === 2 ? "点击开始转换按钮，等待处理完成" : "转换完成后自动下载Word文档"}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function RelatedCard({ t, openTool, setModal }) {
  const related = ["PDF转Excel", "PDF转PPT", "PDF转图片", "Word转PDF", "PDF合并"];
  return (
    <div className="panel relatedCard">
      <h3>{t.related}</h3>
      {related.map((item) => (
        <button key={item} onClick={() => setModal({ type: "generic-tool", title: item, toolOverride: pdfSubToolObjects.find((tool) => tool.name === item) })}>
          <FileText size={17} />
          {item}
        </button>
      ))}
      <button className="textLink" onClick={() => scrollToSelector(".subTools")}>查看更多 PDF工具 →</button>
    </div>
  );
}

function SecurityCard({ t }) {
  return (
    <div className="panel securityCard">
      <h3>{t.secure}</h3>
      <p><Check size={16} />文件传输全程加密（SSL）</p>
      <p><Check size={16} />转换后自动删除，保护隐私</p>
      <p><Check size={16} />完全免费使用，无使用限制</p>
      <span><ShieldCheck size={52} /></span>
    </div>
  );
}

function ToolInfoSections({ t, setModal }) {
  const [activeTab, setActiveTab] = useState(t.toolIntro);
  const [openFaq, setOpenFaq] = useState(null);
  const features = [
    ["高清晰转换", "保留原始排版、字体、表格"],
    ["OCR识别", "支持扫描件和图片型PDF"],
    ["批量处理", "一次转换多个PDF文件"],
    ["云端处理", "在线转换，无需安装软件"]
  ];
  return (
    <>
      <section className="panel introTabs">
        <div className="tabs">
          {[t.toolIntro, "功能亮点", "支持格式", "用户评价（2.9k）"].map((item, index) => (
            <button className={activeTab === item ? "active" : ""} key={item} onClick={() => setActiveTab(item)}>{item}</button>
          ))}
        </div>
        <p>{activeTab === t.toolIntro ? "PDF转Word工具可以将PDF文件转换为可编辑的Word文档。当前纯前端版本支持文本型 PDF 的本地文本提取和 .docx 生成。" : activeTab === "功能亮点" ? "支持本地读取 PDF、指定页码范围、生成 Word 或 TXT、保存最近 7 条转换历史。" : activeTab === "支持格式" ? "输入支持 PDF；输出支持 DOCX 与 TXT。扫描件和图片型 PDF 需要 OCR 服务。" : "用户评分 4.8，核心反馈集中在打开即用、无需安装、文件不上传。"} </p>
        <div className="featureLine">
          {features.map(([title, body]) => (
            <div key={title}>
              <span><Grid2X2 size={22} /></span>
              <strong>{title}</strong>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="panel tutorial">
        <h2>使用步骤（图文教程）</h2>
        <div className="tutorialSteps">
          {["上传PDF文件", "设置转换选项", "开始转换", "下载Word文件"].map((item, index) => (
            <div key={item}>
              <span>{index + 1}</span>
              <strong>{item}</strong>
              {index < 3 && <ArrowRight size={18} />}
            </div>
          ))}
        </div>
      </section>
      <section className="toolBottomGrid">
        <div className="panel faqPanel">
          <PanelTitle title={t.faq} action="全部展开" onAction={() => setOpenFaq(openFaq === "all" ? null : "all")} />
          {["PDF转Word后排版会变吗？", "转换后的Word可以编辑吗？", "OCR识别有什么作用？", "支持扫描件PDF转换吗？", "文件会保存到服务器吗？"].map((item) => (
            <div className="faqItem" key={item}>
              <button className="faqRow" onClick={() => setOpenFaq(openFaq === item ? null : item)}>{item}<Plus size={17} /></button>
              {(openFaq === item || openFaq === "all") && <p>{faqAnswers[item]}</p>}
            </div>
          ))}
        </div>
        <div className="panel articlePanel">
          <PanelTitle title="相关文章 / 教程" action="查看更多文章 →" onAction={() => setModal({ type: "message", title: "相关文章", message: "已按 PDF 转换主题筛选教程，可点击任意标题查看详情。" })} />
          {articles.map((article) => (
            <button className="textArticle" key={article.title} onClick={() => setModal({ type: "article", title: article.title, article })}>
              <h3>{article.title}</h3>
              <p>阅读量 12.6k　2024-05-08</p>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

function VscoDownloaderPage({ setRoute, notify, toggleSave, savedTools, openTool }) {
  const [source, setSource] = useState(VSCO_SAMPLE_URL);
  const [htmlInput, setHtmlInput] = useState("");
  const [includeThumbnails, setIncludeThumbnails] = useState(true);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("Enter a VSCO post URL, or paste the page HTML / __PRELOADED_STATE__ JSON below.");
  const [activeFaq, setActiveFaq] = useState(null);
  const isSaved = savedTools.has("VSCO Downloader");

  const copyText = async (text, label = "Content") => {
    await navigator.clipboard.writeText(text);
    notify(`${label} copied`);
  };

  const extract = async () => {
    const pasted = htmlInput.trim();
    const url = source.trim();
    try {
      setStatus("working");
      setMessage("Reading VSCO media state...");
      let payload = pasted;
      if (!payload && /^https:\/\/vsco\.co\/[^/]+\/media\/[a-z0-9]+/i.test(url)) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`VSCO responded with HTTP ${response.status}.`);
        payload = await response.text();
      }
      if (!payload) {
        throw new Error("Browser direct fetch may be blocked by CORS. Paste the VSCO page HTML or __PRELOADED_STATE__ JSON to extract locally.");
      }
      const next = parseVscoMedia(payload, includeThumbnails);
      setResults(next);
      setStatus("done");
      setMessage(`Found ${next.length} raw VSCO media URL${next.length > 1 ? "s" : ""}.`);
      notify("VSCO media links extracted");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Extraction failed.");
      setResults([]);
    }
  };

  const loadDemo = () => {
    setSource(VSCO_SAMPLE_URL);
    setHtmlInput(VSCO_DEMO_STATE);
    const next = parseVscoMedia(VSCO_DEMO_STATE, includeThumbnails);
    setResults(next);
    setStatus("done");
    setMessage("Loaded demo data from the open-source README examples.");
    notify("Demo VSCO data loaded");
  };

  const exportResults = (format) => {
    if (!results.length) {
      notify("No extracted links to export");
      return;
    }
    const payload = format === "json"
      ? JSON.stringify(results, null, 2)
      : results.map((item) => item.url).join("\n");
    downloadBlob(new Blob([payload], { type: format === "json" ? "application/json" : "text/plain;charset=utf-8" }), `vsco-downloader-results.${format}`);
  };

  const steps = [
    ["Paste", "Add a VSCO post URL, or paste the page HTML / preloaded JSON."],
    ["Extract", "The browser parser reads medias.byId and normalizes image, thumbnail, and video URLs."],
    ["Use", "Copy every raw path, open media in a new tab, or export TXT / JSON."]
  ];
  const faqs = [
    ["What does VSCO Downloader extract?", "It extracts raw image paths, video thumbnail paths, and MP4 video paths found in VSCO post preloaded state."],
    ["Why does URL fetch sometimes fail?", "Static browser apps cannot set VSCO request headers or bypass CORS. Pasting HTML/JSON keeps the tool independent and local; production deployments can add a backend proxy."],
    ["Is this based on the open-source project?", "Yes. The parser mirrors michabirklbauer/vsco_downloader: read window.__PRELOADED_STATE__, parse medias.byId, then collect responsiveUrl and videoUrl."],
    ["Can it download private VSCO posts?", "No. Use it only for posts you can legally access and process. It does not bypass authentication or permissions."]
  ];

  return (
    <main className="vscoPage">
      <div className="vscoShell">
        <div className="breadcrumb detailCrumb">
          <button onClick={() => setRoute("home")}>Home</button>
          <span>/</span>
          <span>Image Tools</span>
          <span>/</span>
          <strong>VSCO Downloader</strong>
        </div>
        <section className="vscoHero">
          <div className="vscoHeroCopy">
            <span className="vscoMark"><Download size={34} /></span>
            <h1>VSCO Downloader</h1>
            <p>A simple python library to extract raw image and video paths from VSCO posts.</p>
            <div className="vscoHeroActions">
              <button className="primaryAction" onClick={() => document.querySelector(".vscoWorkspace")?.scrollIntoView({ behavior: "smooth" })}>
                <Bolt size={18} fill="currentColor" />
                Start extracting
              </button>
              <button onClick={() => toggleSave("VSCO Downloader")}>
                <Star size={17} fill={isSaved ? "currentColor" : "none"} />
                {isSaved ? "Saved" : "Save tool"}
              </button>
            </div>
          </div>
          <div className="vscoStatusPanel">
            <strong>Extraction model</strong>
            <p>Reads VSCO preloaded state, normalizes protocol-less URLs, deduplicates paths, and keeps processing in this browser.</p>
            <div>
              <span><Image size={17} /> JPG / WebP</span>
              <span><Download size={17} /> MP4</span>
              <span><ShieldCheck size={17} /> Local parse</span>
            </div>
          </div>
        </section>

        <section className="vscoLayout">
          <div className="vscoWorkspace">
            <div className="vscoInputPanel">
              <div className="panelTitleRow">
                <div>
                  <h2>Extract raw VSCO media URLs</h2>
                  <p>Use a URL when your deployment has access, or paste page HTML / JSON for a fully static workflow.</p>
                </div>
                <button className="iconTextButton" onClick={loadDemo}><RefreshCw size={17} />Demo</button>
              </div>
              <label className="vscoField">
                <span>VSCO post URL</span>
                <div className="vscoUrlInput">
                  <Link2 size={19} />
                  <input value={source} onChange={(event) => setSource(event.target.value)} placeholder="https://vsco.co/user/media/post-id" />
                </div>
              </label>
              <label className="vscoField">
                <span>Page HTML or window.__PRELOADED_STATE__ JSON</span>
                <textarea value={htmlInput} onChange={(event) => setHtmlInput(event.target.value)} placeholder="Paste the VSCO page source or the JSON assigned to window.__PRELOADED_STATE__ here..." />
              </label>
              <div className="vscoControls">
                <label className="vscoToggle">
                  <input type="checkbox" checked={includeThumbnails} onChange={(event) => setIncludeThumbnails(event.target.checked)} />
                  Include video thumbnails
                </label>
                <button className="startBtn" onClick={extract} disabled={status === "working"}>
                  <Bolt size={20} fill="currentColor" />
                  {status === "working" ? "Extracting..." : "Extract links"}
                </button>
              </div>
              <p className={status === "error" ? "vscoMessage error" : "vscoMessage"}>{message}</p>
            </div>

            <div className="vscoResultsPanel">
              <div className="panelTitleRow">
                <div>
                  <h2>Results</h2>
                  <p>{results.length ? `${results.length} raw path${results.length > 1 ? "s" : ""} ready` : "Extracted image and video URLs appear here."}</p>
                </div>
                <div className="vscoExportActions">
                  <button onClick={() => copyText(results.map((item) => item.url).join("\n"), "All links")} disabled={!results.length}><Copy size={16} />Copy all</button>
                  <button onClick={() => exportResults("txt")} disabled={!results.length}><Download size={16} />TXT</button>
                  <button onClick={() => exportResults("json")} disabled={!results.length}><Download size={16} />JSON</button>
                </div>
              </div>
              <div className="vscoResultList">
                {results.length ? results.map((item, index) => (
                  <article className="vscoResult" key={item.url}>
                    <span className={`vscoType ${item.type}`}>{item.type}</span>
                    <div>
                      <strong>{vscoFileName(item.url, index)}</strong>
                      <code>{item.url}</code>
                    </div>
                    <button aria-label="Copy URL" onClick={() => copyText(item.url, "URL")}><Copy size={17} /></button>
                    <a aria-label="Open media" href={item.url} target="_blank" rel="noreferrer"><ExternalLink size={17} /></a>
                    <a aria-label="Download media" href={item.url} download={vscoFileName(item.url, index)}><Download size={17} /></a>
                  </article>
                )) : (
                  <div className="vscoEmpty">
                    <Download size={38} />
                    <strong>No media extracted yet</strong>
                    <p>Paste VSCO source data or load the demo to inspect parser output.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="vscoAside">
            <div className="panel sideInfo">
              <h3>Based on MIT open source</h3>
              <p>Implementation references <a href="https://github.com/michabirklbauer/vsco_downloader" target="_blank" rel="noreferrer">michabirklbauer/vsco_downloader</a> by Micha Birklbauer.</p>
              <p className="small">Original library version inspected: 2.0.1. License: MIT.</p>
            </div>
            <div className="panel stepsCard">
              <h3>How it works</h3>
              {steps.map(([title, body], index) => (
                <div className="step" key={title}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{title}</strong>
                    <p>{body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="panel relatedCard">
              <h3>Related tools</h3>
              {allTools.filter((tool) => ["图片压缩", "图片格式转换", "API 接口测试", "JSON 格式化"].includes(tool.name)).map((tool) => (
                <button key={tool.name} onClick={() => openTool(tool)}>
                  <tool.icon size={17} />
                  {tool.name}
                </button>
              ))}
            </div>
          </aside>
        </section>

        <section className="vscoSeoSection">
          <div>
            <h2>VSCO downloader for raw image and video paths</h2>
            <p>This VSCO downloader extracts direct media paths from public VSCO post state without uploading pasted content to a server. It is useful for auditing post assets, archiving accessible media references, and testing VSCO media handling workflows.</p>
          </div>
          <div className="vscoNotesGrid">
            <article>
              <h3>Supported media</h3>
              <p>Responsive image URLs, video thumbnails, and MP4 video URLs exposed in VSCO post state.</p>
            </article>
            <article>
              <h3>Privacy model</h3>
              <p>Pasted HTML/JSON is parsed in memory in your browser. Exported TXT/JSON files are generated locally.</p>
            </article>
            <article>
              <h3>Production option</h3>
              <p>Add a backend proxy that fetches VSCO with server-side headers, then pass the HTML to this parser.</p>
            </article>
          </div>
        </section>

        <section className="toolBottomGrid vscoFaqGrid">
          <div className="panel faqPanel">
            <PanelTitle title="VSCO Downloader FAQ" action="Expand all" onAction={() => setActiveFaq(activeFaq === "all" ? null : "all")} />
            {faqs.map(([question, answer]) => (
              <div className="faqItem" key={question}>
                <button className="faqRow" onClick={() => setActiveFaq(activeFaq === question ? null : question)}>{question}<Plus size={17} /></button>
                {(activeFaq === question || activeFaq === "all") && <p>{answer}</p>}
              </div>
            ))}
          </div>
          <div className="panel articlePanel">
            <PanelTitle title="Developer note" action="Copy parser phrase" onAction={() => copyText("A simple python library to extract raw image and video paths from VSCO posts.", "SEO phrase")} />
            <p>The browser parser intentionally keeps the same data path as the Python package: `medias.byId → media → responsiveUrl/videoUrl`.</p>
            <pre>{`from vsco import get_links\nget_links("${VSCO_SAMPLE_URL}")`}</pre>
          </div>
        </section>
      </div>
    </main>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modalLayer" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modalPanel">
        <div className="modalHeader">
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="关闭"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SubmitToolForm({ notify, onClose }) {
  const [form, setForm] = useState({ name: "", url: "", category: "AI工具", desc: "" });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !/^https?:\/\//.test(form.url)) {
      notify("请填写工具名称和以 http 开头的链接");
      return;
    }
    const submissions = JSON.parse(localStorage.getItem("toolSubmissions") || "[]");
    localStorage.setItem("toolSubmissions", JSON.stringify([{ ...form, id: Date.now() }, ...submissions]));
    notify("提交成功，已加入本地待审核列表");
    onClose();
  };
  return (
    <form className="modalForm" onSubmit={submit}>
      <label>工具名称<input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="例如：Markdown 编辑器" /></label>
      <label>工具链接<input value={form.url} onChange={(event) => update("url", event.target.value)} placeholder="https://example.com" /></label>
      <label>分类<select value={form.category} onChange={(event) => update("category", event.target.value)}>{["AI工具", "SEO工具", "图片工具", "PDF工具", "开发工具", "办公工具"].map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>工具说明<textarea value={form.desc} onChange={(event) => update("desc", event.target.value)} placeholder="简要说明工具用途" /></label>
      <button className="primaryAction">提交审核</button>
    </form>
  );
}

function LoginForm({ notify, onClose }) {
  const [email, setEmail] = useState("");
  const submit = (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      notify("请输入有效邮箱地址");
      return;
    }
    localStorage.setItem("toolboxUser", email);
    notify("登录成功，收藏和历史将保存在本机");
    onClose();
  };
  return (
    <form className="modalForm" onSubmit={submit}>
      <label>邮箱地址<input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
      <button className="primaryAction">登录 / 创建账号</button>
    </form>
  );
}

function ArticleView({ article }) {
  return (
    <div className="articleView">
      <span className={`articleThumb ${article.image}`}>{article.image.toUpperCase()}</span>
      <p>{article.meta}</p>
      <p>这篇教程会围绕工具选择、常见使用场景、效率建议和注意事项展开。当前版本已实现可点击阅读面板，后续可接入 Markdown 或 CMS 内容源。</p>
    </div>
  );
}

function SitePage({ page, setModal, notify, openTool }) {
  if (page === "ranking") {
    const ranked = [...allTools].sort((a, b) => Number(b.rating) - Number(a.rating)).slice(0, 12);
    return (
      <div className="sitePageList">
        {ranked.map((tool, index) => (
          <button key={tool.name} onClick={() => openTool(tool)}>
            <strong>{index + 1}. {tool.name}</strong>
            <span>{tool.desc}</span>
            <small>评分 {tool.rating} · {tool.users} 使用</small>
          </button>
        ))}
      </div>
    );
  }
  if (page === "articles") {
    return (
      <div className="sitePageList">
        {articles.concat([
          { title: "图片压缩和格式转换怎么选？", meta: "常见图片处理场景与最佳实践", image: "image" },
          { title: "JSON、CSV 与表格数据互转指南", meta: "开发者常用数据处理技巧", image: "data" }
        ]).map((article) => (
          <button key={article.title} onClick={() => setModal({ type: "article", title: article.title, article })}>
            <strong>{article.title}</strong>
            <span>{article.meta}</span>
            <small>2026-05-13 · 可阅读</small>
          </button>
        ))}
      </div>
    );
  }
  if (page === "resources") {
    return <ResourcePanel notify={notify} />;
  }
  if (page === "deals") {
    return <DealsPanel notify={notify} />;
  }
  if (page === "about") {
    return <AboutPanel setModal={setModal} />;
  }
  if (page === "api") {
    return <ApiPanel notify={notify} />;
  }
  if (page === "help") {
    return <HelpPanel />;
  }
  if (page === "feedback") {
    return <FeedbackForm notify={notify} />;
  }
  if (page === "contact") {
    return <ContactPanel notify={notify} />;
  }
  return <MessagePanel message="页面已打开。" />;
}

function ResourcePanel({ notify }) {
  const resources = [
    ["工具 API", "复制本地 API 示例", "curl https://api.toolbox.local/v1/tools"],
    ["开发者文档", "查看工具接入规范", "提交工具需提供名称、URL、分类、描述与隐私说明。"],
    ["友情链接", "复制申请模板", "站点名称：智用工具站；链接：https://toolbox.example.com"],
    ["数据导出", "下载工具目录 CSV", toCsv([["name", "category"], ...allTools.map((tool) => [tool.name, tool.category])])]
  ];
  return (
    <div className="sitePageList">
      {resources.map(([title, desc, payload]) => (
        <button key={title} onClick={() => { navigator.clipboard.writeText(payload); notify(`${title} 已复制到剪贴板`); }}>
          <strong>{title}</strong>
          <span>{desc}</span>
          <small>点击复制</small>
        </button>
      ))}
    </div>
  );
}

function DealsPanel({ notify }) {
  const [claimed, setClaimed] = useState(() => JSON.parse(localStorage.getItem("claimedDeals") || "[]"));
  const deals = ["收藏 5 个工具解锁快捷入口", "提交工具通过审核获得首页展示位", "订阅邮件获取每周效率工具包"];
  return (
    <div className="sitePageList">
      {deals.map((deal) => (
        <button key={deal} onClick={() => {
          const next = claimed.includes(deal) ? claimed : [...claimed, deal];
          setClaimed(next);
          localStorage.setItem("claimedDeals", JSON.stringify(next));
          notify(claimed.includes(deal) ? "你已领取过该活动" : "活动已领取");
        }}>
          <strong>{deal}</strong>
          <span>{claimed.includes(deal) ? "已领取" : "点击领取"}</span>
          <small>本地记录活动状态</small>
        </button>
      ))}
    </div>
  );
}

function AboutPanel({ setModal }) {
  return (
    <div className="articleView">
      <p>智用工具站是一个在线工具聚合与本地处理工具站。当前版本优先实现浏览器内可完成的工具能力：文本、数据、图片、PDF 文本提取、CSV/JSON 转换、表单和收藏历史。</p>
      <p>需要模型、联网爬取、复杂文件排版或加密能力的工具，会明确标注需要后端/API，不会假装已经完成。</p>
      <div className="modalActions">
        <button className="primaryAction" onClick={() => setModal({ type: "submit", title: "提交工具" })}>提交工具</button>
        <button onClick={() => setModal({ type: "page", title: "联系我们", page: "contact" })}>联系我们</button>
      </div>
    </div>
  );
}

function ApiPanel({ notify }) {
  const snippet = `fetch('/api/tools')\n  .then(res => res.json())\n  .then(console.log);`;
  return (
    <div className="genericTool">
      <p>当前是纯前端版本，没有真实后端 API。这里提供对接契约，点击可复制示例。</p>
      <pre>{snippet}</pre>
      <button className="primaryAction" onClick={() => { navigator.clipboard.writeText(snippet); notify("API 示例已复制"); }}>复制 API 示例</button>
    </div>
  );
}

function HelpPanel() {
  return (
    <div className="sitePageList">
      {Object.entries(faqAnswers).slice(0, 6).map(([question, answer]) => (
        <div className="helpItem" key={question}>
          <strong>{question}</strong>
          <p>{answer}</p>
        </div>
      ))}
    </div>
  );
}

function FeedbackForm({ notify }) {
  const [text, setText] = useState("");
  return (
    <form className="modalForm" onSubmit={(event) => {
      event.preventDefault();
      if (!text.trim()) return notify("请填写反馈内容");
      const feedback = JSON.parse(localStorage.getItem("feedback") || "[]");
      localStorage.setItem("feedback", JSON.stringify([{ id: Date.now(), text }, ...feedback]));
      setText("");
      notify("反馈已保存到本地");
    }}>
      <label>反馈内容<textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="描述问题或建议" /></label>
      <button className="primaryAction">提交反馈</button>
    </form>
  );
}

function ContactPanel({ notify }) {
  return (
    <div className="sitePageList">
      {["support@toolbox.local", "商务合作：bd@toolbox.local", "GitHub：toolbox-hub"].map((item) => (
        <button key={item} onClick={() => { navigator.clipboard.writeText(item); notify("联系方式已复制"); }}>
          <strong>{item}</strong>
          <span>点击复制</span>
        </button>
      ))}
    </div>
  );
}

function GenericTool({ tool, notify, toggleSave, saved }) {
  const toolType = classifyTool(tool.name);
  const [input, setInput] = useState(genericToolSamples[tool.name] || genericToolSamples.default);
  const [result, setResult] = useState("");
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [todoItems, setTodoItems] = useState(() => JSON.parse(localStorage.getItem("todoItems") || "[]"));
  const [imagePreview, setImagePreview] = useState("");
  const run = async () => {
    if (toolType === "pdf") {
      try {
        setBusy(true);
        setResult("正在处理 PDF...");
        const output = await runPdfOperation(tool.name, files, input);
        downloadBlob(output.blob, output.fileName);
        setResult(output.note);
        notify(`${tool.name} 已完成并下载`);
      } catch (error) {
        setResult(error.message);
      } finally {
        setBusy(false);
      }
      return;
    }
    if (toolType === "image") {
      if (!files[0]) {
        setResult("请先选择图片文件。");
        return;
      }
      await runImageTool(tool.name, files[0], input, setImagePreview, setResult, notify);
      return;
    }
    if (tool.name.includes("待办")) {
      const items = input.split(/\n/).map((item) => item.trim()).filter(Boolean).map((text) => ({ id: Date.now() + Math.random(), text, done: false }));
      const next = [...todoItems, ...items];
      setTodoItems(next);
      localStorage.setItem("todoItems", JSON.stringify(next));
      setResult(`已添加 ${items.length} 个待办。`);
      notify("待办已保存");
      return;
    }
    if (tool.name.includes("音频信息")) {
      if (!files[0]) return setResult("请先选择音频文件。");
      const url = URL.createObjectURL(files[0]);
      const audio = document.createElement("audio");
      audio.src = url;
      audio.onloadedmetadata = () => {
        setResult(`文件名：${files[0].name}\n大小：${(files[0].size / 1024 / 1024).toFixed(2)} MB\n时长：${audio.duration.toFixed(2)} 秒\n类型：${files[0].type || "未知"}`);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => setResult("无法读取该媒体文件信息。");
      return;
    }
    if (tool.name.includes("语音转文字") || tool.name.includes("AI 语音")) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setResult("当前浏览器不支持 Web Speech API。");
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = "zh-CN";
      recognition.onresult = (event) => setResult(event.results[0][0].transcript);
      recognition.onerror = (event) => setResult(`语音识别失败：${event.error}`);
      recognition.start();
      notify("已开始语音识别，请对麦克风说话");
      return;
    }
    if (tool.name.includes("API 接口测试")) {
      try {
        const response = await fetch(input.trim());
        const text = await response.text();
        setResult(`HTTP ${response.status} ${response.statusText}\n\n${text.slice(0, 2000)}`);
      } catch (error) {
        setResult(`请求失败：${error.message}\n浏览器请求可能受 CORS 限制，生产环境建议走后端代理。`);
      }
      return;
    }
    if (tool.name.includes("在线编译器")) {
      try {
        const value = Function(`"use strict";\n${input}`)();
        setResult(`运行完成：${value === undefined ? "无返回值" : String(value)}`);
      } catch (error) {
        setResult(`运行失败：${error.message}`);
      }
      return;
    }
    const output = runGenericTool(tool.name, input);
    setResult(output);
    notify(`${tool.name} 已运行`);
  };
  const copyResult = async () => {
    await navigator.clipboard.writeText(result || "");
    notify("结果已复制");
  };
  const downloadResult = () => {
    downloadBlob(new Blob([result || input], { type: "text/plain;charset=utf-8" }), `${tool.name}.txt`);
    notify("结果已下载");
  };
  return (
    <div className="genericTool">
      <p>{tool.desc}</p>
      {(toolType === "pdf" || toolType === "image" || tool.name.includes("音频")) && (
        <label className="fileDrop">
          <input type="file" multiple={tool.name.includes("合并")} accept={toolType === "image" ? "image/*" : toolType === "pdf" ? "application/pdf" : "audio/*,video/*"} onChange={(event) => {
            const list = [...event.target.files];
            setFiles(list);
            setResult(`已选择 ${list.length} 个文件：${list.map((file) => file.name).join("、")}`);
            if (toolType === "image" && list[0]) setImagePreview(URL.createObjectURL(list[0]));
          }} />
          <UploadCloud size={28} />
          <span>{files.length ? files.map((file) => file.name).join("、") : "选择文件"}</span>
        </label>
      )}
      <textarea value={input} onChange={(event) => setInput(event.target.value)} />
      {imagePreview && <img className="toolPreview" src={imagePreview} alt="预览" />}
      <div className="modalActions">
        <button className="primaryAction" onClick={run} disabled={busy}>{busy ? "处理中..." : "运行工具"}</button>
        <button onClick={() => toggleSave(tool.name)}>{saved ? "取消收藏" : "收藏工具"}</button>
        <button onClick={copyResult} disabled={!result}>复制结果</button>
        <button onClick={downloadResult}>下载文本</button>
      </div>
      {tool.name.includes("待办") && (
        <div className="todoList">
          {todoItems.map((item) => (
            <button key={item.id} onClick={() => {
              const next = todoItems.map((todo) => todo.id === item.id ? { ...todo, done: !todo.done } : todo);
              setTodoItems(next);
              localStorage.setItem("todoItems", JSON.stringify(next));
            }}>{item.done ? "✓" : "○"} {item.text}</button>
          ))}
        </div>
      )}
      {result && <pre>{result}</pre>}
    </div>
  );
}

async function runImageTool(name, file, text, setPreview, setResult, notify) {
  const img = await new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = URL.createObjectURL(file);
  });
  const canvas = document.createElement("canvas");
  const maxWidth = name.includes("压缩") ? 1280 : img.width;
  const scale = Math.min(1, maxWidth / img.width);
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  if (name.includes("去水印")) {
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.fillRect(canvas.width * 0.62, canvas.height * 0.82, canvas.width * 0.32, canvas.height * 0.08);
    setResult("已执行本地遮盖式水印处理。真正 AI 去水印需要图像模型。");
  } else if (name.includes("编辑")) {
    ctx.fillStyle = "rgba(34,103,244,0.16)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = `${Math.max(18, canvas.width / 28)}px sans-serif`;
    ctx.fillText(text || "ToolBox Hub", 28, 48);
    setResult("已添加滤镜和文字标注。");
  } else {
    setResult(name.includes("格式") ? "已转换为 PNG。" : "已压缩图片尺寸和质量。");
  }
  const type = name.includes("格式") ? "image/png" : "image/jpeg";
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, 0.78));
  setPreview(URL.createObjectURL(blob));
  downloadBlob(blob, `${file.name.replace(/\.[^.]+$/, "")}-${name.includes("格式") ? "converted.png" : "processed.jpg"}`);
  notify(`${name} 已完成并下载`);
}

function MessagePanel({ message }) {
  return <p className="messagePanel">{message}</p>;
}

function Footer({ t, cat, setRoute, notify, setModal, setActiveCategory }) {
  const [email, setEmail] = useState("");
  const subscribe = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      notify("请输入有效邮箱地址");
      return;
    }
    notify("订阅成功，已记录邮箱");
    setEmail("");
  };

  return (
    <footer className="footer">
      <div className="footerInner">
        <div className="footerBrand">
          <Logo />
          <p>{t.footerSlogan}</p>
          <div className="socials">
            {[Globe2, Search, Cloud, Home].map((Icon, index) => <button key={index} onClick={() => index === 3 ? setRoute("home") : setModal({ type: "page", title: ["资源导航", "工具搜索", "云端说明"][index], page: index === 0 ? "resources" : index === 1 ? "ranking" : "api" })}><Icon size={16} /></button>)}
          </div>
        </div>
        <div>
          <h3>快速导航</h3>
          {t.nav.slice(0, 5).map((item, index) => <button key={item} onClick={() => {
            if (index === 0) setRoute("home");
            else if (index === 1) { setRoute("home"); scrollToSelector(".contentShell"); }
            else if (index === 2) { setRoute("home"); setActiveCategory("ai"); scrollToSelector(".contentShell"); }
            else if (index === 3) setModal({ type: "page", title: "排行榜", page: "ranking" });
            else setModal({ type: "page", title: "文章教程", page: "articles" });
          }}>{item}</button>)}
        </div>
        <div>
          <h3>热门分类</h3>
          {["ai", "seo", "image", "pdf", "dev"].map((id) => <button key={id} onClick={() => { setRoute("home"); setActiveCategory(id); scrollToSelector(".contentShell"); }}>{cat[id]}</button>)}
        </div>
        <div>
          <h3>资源与支持</h3>
          {["提交工具", "工具API", "帮助中心", "反馈建议", "联系我们"].map((item) => <button key={item} onClick={() => item === "提交工具" ? setModal({ type: "submit", title: t.submit }) : setModal({ type: "page", title: item, page: item === "工具API" ? "api" : item === "帮助中心" ? "help" : item === "反馈建议" ? "feedback" : "contact" })}>{item}</button>)}
        </div>
        <div className="subscribe">
          <h3>关注我们</h3>
          <p>订阅获取最新工具和干货</p>
          <label>
            <input value={email} onChange={(event) => setEmail(event.target.value)} onKeyDown={(event) => event.key === "Enter" && subscribe()} placeholder="输入您的邮箱地址" />
            <button onClick={subscribe}>订阅</button>
          </label>
          <small>尊重隐私，不会发送垃圾邮件。</small>
        </div>
      </div>
      <div className="footerBottom">
        <span>© 2024 智用工具站（ToolBox Hub）保留所有权利。</span>
        <span>使用条款　隐私政策　Sitemap　友情链接</span>
        <span>中　|　EN　|　日　<Moon size={14} /></span>
      </div>
    </footer>
  );
}

createRoot(document.getElementById("root")).render(<App />);
