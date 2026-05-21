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
  ShieldCheck,
  Sparkles,
  Star,
  Table2,
  Wand2
} from "../shared/icons.js";
import { expandedToolCatalog } from "./expandedTools.js";

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

const baseCategories = [
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

const baseToolGroups = [
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

const iconRegistry = {
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
  ShieldCheck,
  Sparkles,
  Star,
  Table2,
  Wand2
};

const materializeExpandedTool = ({ iconKey, ...tool }) => ({
  ...tool,
  icon: iconRegistry[iconKey] || categoryIcons[tool.category] || Sparkles
});

const expandedToolsByCategory = expandedToolCatalog.reduce((groups, tool) => {
  if (!tool?.category || !tool?.route) return groups;
  const bucket = groups[tool.category] || [];
  if (!bucket.some((existing) => existing.route === tool.route || existing.name === tool.name)) {
    bucket.push(tool);
  }
  return {
    ...groups,
    [tool.category]: bucket
  };
}, {});

const toolGroups = baseToolGroups.map((group) => {
  const existingRoutes = new Set(group.tools.map((tool) => tool.route).filter(Boolean));
  const existingNames = new Set(group.tools.map((tool) => tool.name));
  const expandedTools = (expandedToolsByCategory[group.id] || [])
    .filter((tool) => !existingRoutes.has(tool.route) && !existingNames.has(tool.name))
    .map(materializeExpandedTool);

  return {
    ...group,
    tools: [...group.tools, ...expandedTools]
  };
});

const categoryToolCounts = Object.fromEntries(toolGroups.map((group) => [group.id, group.tools.length]));
const totalToolCount = toolGroups.reduce((sum, group) => sum + group.tools.length, 0);
const categories = baseCategories.map((category) => ({
  ...category,
  count: category.id === "all" ? `${totalToolCount}` : `${categoryToolCounts[category.id] || 0}`
}));

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
  "AI 标题生成器": "在线工具站增长",
  "AI 摘要生成器": "我们要做一个覆盖 PDF、图片、SEO、开发和办公场景的在线工具站。每个工具都需要独立落地页，方便 SEO 收录，同时页面要简单易用。",
  "AI 邮件助手": "subject: 项目进度同步\ngoal: 本周已完成 SEO 落地页和工具逻辑扩展，需要确认下一批优先级",
  "AI 周报生成器": "完成 146 个工具落地页\n补齐 SEO sitemap\n新增 CSV 和房贷计算器逻辑",
  "AI 小红书文案": "在线工具站提效",
  "AI 短视频脚本": "3 分钟介绍在线工具站",
  "AI 面试题生成器": "前端工程师",
  "AI 学习计划": "4 周掌握 React 工具站开发",
  "AI 代码解释器": "function sum(a,b){return a+b}",
  "Meta 标签生成器": "title: 智用工具站\ndescription: 精选高效在线工具\nkeywords: 在线工具,SEO,PDF",
  "Robots.txt 生成器": "/admin\n/private\nhttps://newaitools.app/sitemap.xml",
  "Sitemap 生成器": "https://newaitools.app/\nhttps://newaitools.app/tools/json-formatter",
  "Slug 生成器": "Best Online Tools for SEO and PDF",
  "标题长度检测": "智用工具站 - 免费在线工具大全",
  "描述长度检测": "智用工具站收录高效好用的在线工具，覆盖 PDF、图片、SEO、开发、文本处理和日常效率场景。",
  "关键词密度分析": "在线工具 SEO 工具 PDF 工具 在线工具 图片工具 SEO 工具",
  "Open Graph 预览": "title: 智用工具站\ndescription: 免费在线工具大全\nurl: https://newaitools.app\nimage: https://newaitools.app/og.png",
  "Schema 标记生成器": "name: 智用工具站\ndescription: 免费在线工具大全\nurl: https://newaitools.app",
  "URL 参数清理": "https://example.com/page?utm_source=newsletter&utm_campaign=spring&id=42&fbclid=abc",
  "URL 编码解码": "https://example.com/?q=在线工具",
  "HTML 实体转义": "<strong>ToolBox Hub</strong>",
  "JWT 解码器": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.sig",
  "哈希生成器": "ToolBox Hub",
  "Base64 转图片": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "Favicon 生成器": "/favicon.png",
  "SVG 压缩": "<svg width=\"100\" height=\"100\">\n  <!-- comment -->\n  <rect width=\"100\" height=\"100\" fill=\"red\" />\n</svg>",
  "YAML 转 JSON": "name: ToolBox Hub\ncount: 146\nactive: true",
  "JSON 转 YAML": "{\"name\":\"ToolBox Hub\",\"count\":146,\"active\":true}",
  "XML 格式化": "<root><tool>JSON</tool><score>4.8</score></root>",
  "SQL 格式化": "select name,score from tools where category='seo' order by score desc",
  "CSS 压缩": "body { color: red; padding: 16px; }",
  "JavaScript 压缩": "function hello() { console.log('ToolBox Hub'); }",
  "Cron 表达式解析": "*/5 * * * *",
  "User-Agent 解析": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
  "CSV 清洗": "name, value\n A , 1\n A , 1\nB,2",
  "CSV 排序": "name,value\nB,2\nA,1",
  "CSV 合并": "name,value\nA,1\n---\nname,value\nB,2",
  "JSON 路径提取": "user.name\n{\"user\":{\"name\":\"Ada\"}}",
  "JSON Schema 生成": "{\"name\":\"Ada\",\"age\":3}",
  "表格转 Markdown": "name,value\nA,1",
  "Markdown 转表格": "| name | value |\n| --- | --- |\n| A | 1 |",
  "列表交集差集": "a\nb\n---\nb\nc",
  "数字序列生成器": "1 10 2",
  "数据透视摘要": "category,amount\nAI,3\nAI,4\nSEO,2",
  "会议纪要生成器": "确认首页分类优先级\n补齐工具真实逻辑\n下周验证移动端体验",
  "OKR 生成器": "提升在线工具站搜索流量和留存",
  "甘特图数据生成": "设计工具目录\n开发落地页\n补齐测试\n上线验证",
  "发票抬头整理": "company: 智用科技有限公司\ntax: 91310000000000000X\naddress: 上海市示例路 1 号\nbank: 招商银行 123456",
  "简历要点优化": "负责工具站 SEO 落地页\n优化前端性能\n搭建自动化测试",
  "邮件签名生成器": "name: 张三\ntitle: 产品经理\ncompany: 智用科技\nphone: 13800000000\nemail: zhangsan@example.com",
  "请假条生成器": "name: 张三\ndate: 2026-05-22\nreason: 家庭事务需要处理",
  "日报生成器": "完成工具目录扩展\n修复路由问题\n补充测试用例",
  "标点格式化": "hello, world! 这是 一个 test ?",
  "繁简转换": "在线工具转换",
  "拼音转换": "在线工具",
  "Lorem Ipsum 生成器": "3",
  "敏感词检测": "这是一段需要检测是否包含敏感词的文本",
  "字幕格式转换": "1\n00:00:00,000 --> 00:00:03,000\n大家好",
  "视频标题生成器": "在线工具站",
  "播客大纲生成": "独立开发工具站",
  "音频转写清理": "嗯 今天我们就是 来聊聊 在线工具站 然后然后 看看怎么做",
  "B站标题助手": "在线工具站实战",
  "YouTube 标签生成": "online tools seo productivity",
  "章节时间轴生成": "开场\n工具目录\nSEO 落地页\n总结",
  "番茄钟": "25 5 4",
  "习惯打卡": "阅读\n运动\n复盘",
  "房贷计算器": "100 4.2 30",
  "汇率换算器": "100 7.2",
  "小费计算器": "100 18 2",
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
