import {
  Archive,
  BadgeCheck,
  BarChart3,
  Bolt,
  BookOpen,
  Bot,
  Boxes,
  Braces,
  Check,
  Clock3,
  Code2,
  Copy,
  Download,
  FileArchive,
  FileImage,
  FileText,
  Globe2,
  Image,
  Languages,
  Layers3,
  Link2,
  Lock,
  Mic,
  MonitorSmartphone,
  Pencil,
  RefreshCw,
  Search,
  Sparkles,
  Table2,
  Wand2
} from "../shared/icons.js";

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
      { name: "PDF 转 Word", icon: FileText, desc: "PDF 转换为可编辑 Word", tags: ["转换", "Word"], rating: "4.8", users: "93.2K", route: "pdf-word", featured: true },
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
      { name: "Base64 编码解码", icon: Copy, desc: "文本 Base64 编码与解码", tags: ["Base64", "编码"], rating: "4.8", users: "69.4K" },
      { name: "Unix 时间戳转换", icon: Clock3, desc: "Unix 秒、毫秒与日期互转", tags: ["时间戳", "日期"], rating: "4.8", users: "63.7K" },
      { name: "UUID 生成器", icon: RefreshCw, desc: "批量生成 RFC 4122 UUID v4", tags: ["UUID", "生成"], rating: "4.7", users: "58.8K" },
      { name: "密码生成器", icon: Lock, desc: "生成高强度随机密码", tags: ["密码", "安全"], rating: "4.8", users: "75.6K" },
      { name: "正则测试器", icon: Search, desc: "测试正则匹配与捕获分组", tags: ["Regex", "调试"], rating: "4.7", users: "55.9K" },
      { name: "文本 Diff 对比", icon: Layers3, desc: "按行对比两段文本差异", tags: ["Diff", "文本"], rating: "4.7", users: "50.2K" },
      { name: "二维码生成器", icon: Link2, desc: "把链接或文本生成 SVG 二维码", tags: ["QR", "SVG"], rating: "4.8", users: "82.1K" },
      { name: "颜色转换器", icon: Sparkles, desc: "HEX、RGB、HSL 颜色互转", tags: ["颜色", "CSS"], rating: "4.6", users: "45.7K" },
      { name: "单位换算器", icon: Table2, desc: "长度、重量、温度等常用换算", tags: ["单位", "换算"], rating: "4.6", users: "49.3K" },
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
  "Base64 编码解码": "encode: 你好 ToolBox",
  "Unix 时间戳转换": "1700000000",
  "UUID 生成器": "5",
  "密码生成器": "length=20 uppercase lowercase numbers symbols",
  "正则测试器": "/(tool)(\\d+)/gi\nTool1 tool22 none",
  "文本 Diff 对比": "旧版本第一行\n保留行\n---\n新版本第一行\n保留行",
  "二维码生成器": "https://example.com",
  "颜色转换器": "#336699",
  "单位换算器": "10 km to mi",
  "代码格式化": "function hello(){console.log('ToolBox Hub')}",
  "关键词查询": "在线工具站\nPDF转Word\nAI工具",
  "文档翻译": "欢迎使用智用工具站",
  default: "在这里输入要处理的内容，点击运行工具。"
};

export {
  categoryIcons,
  categories,
  toolGroups,
  pdfSubTools,
  allTools,
  pdfSubToolObjects,
  faqs,
  articles,
  faqAnswers,
  genericToolSamples
};
