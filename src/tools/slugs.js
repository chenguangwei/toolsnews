import { expandedToolCatalog } from "../data/expandedTools.js";

const genericToolSlugs = {
  "ChatGPT 镜像": "chatgpt-mirror",
  "AI 绘画生成器": "ai-image-generator",
  "智能写作助手": "ai-writing-assistant",
  "AI 语音转文字": "ai-speech-to-text",
  "关键词查询": "keyword-research",
  "网站 SEO 检测": "seo-audit",
  "外链查询工具": "backlink-checker",
  "SERP 排名查询": "serp-rank-checker",
  "图片压缩": "image-compressor",
  "图片格式转换": "image-converter",
  "图片去水印": "image-watermark-remover",
  "图片编辑器": "image-editor",
  "PDF 合并": "pdf-merge",
  "PDF 压缩": "pdf-compress",
  "PDF 签名": "pdf-sign",
  "JSON 格式化": "json-formatter",
  "Base64 编码解码": "base64-encoder-decoder",
  "Unix 时间戳转换": "unix-timestamp-converter",
  "UUID 生成器": "uuid-generator",
  "密码生成器": "password-generator",
  "正则测试器": "regex-tester",
  "文本 Diff 对比": "text-diff",
  "二维码生成器": "qr-code-generator",
  "颜色转换器": "color-converter",
  "单位换算器": "unit-converter",
  "代码格式化": "code-formatter",
  "在线编译器": "online-compiler",
  "API 接口测试": "api-tester",
  "在线表格": "online-spreadsheet",
  "思维导图": "mind-map",
  "PPT 模板库": "ppt-templates",
  "文档翻译": "document-translator",
  "字数统计": "word-counter",
  "文本去重": "text-deduplicate",
  "大小写转换": "case-converter",
  "Markdown 预览": "markdown-preview",
  "音频信息读取": "audio-info-reader",
  "语音转文字": "speech-to-text",
  "字幕时间轴": "subtitle-timeline",
  "视频脚本分镜": "video-storyboard",
  "CSV 转 JSON": "csv-to-json",
  "JSON 转 CSV": "json-to-csv",
  "数据去重": "data-deduplicate",
  "统计摘要": "statistics-summary",
  "日期计算器": "date-calculator",
  "待办清单": "todo-list",
  "预算计算器": "budget-calculator",
  "随机抽签": "random-picker"
};

const expandedToolSlugs = Object.fromEntries(
  expandedToolCatalog.map((tool) => [tool.name, tool.route])
);

function getToolRouteId(tool) {
  return tool?.route || genericToolSlugs[tool?.name] || expandedToolSlugs[tool?.name] || null;
}

function getToolHashPath(tool) {
  const routeId = getToolRouteId(tool);
  return routeId ? `/${routeId}` : null;
}

export {
  expandedToolSlugs,
  genericToolSlugs,
  getToolHashPath,
  getToolRouteId
};
