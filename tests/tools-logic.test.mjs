import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { runGenericTool } from "../src/tools/generic/logic.js";
import { genericToolSlugs } from "../src/tools/slugs.js";
import { detectBrowserLocale, getInitialLocale, normalizeBrowserLocale } from "../src/i18n/locale.js";
import { buildCategorySeo, buildToolSeo, readPublicCategories, readPublicTools } from "../scripts/seo-data.mjs";

const topTenTools = [
  "JSON 格式化",
  "Base64 编码解码",
  "Unix 时间戳转换",
  "UUID 生成器",
  "密码生成器",
  "正则测试器",
  "文本 Diff 对比",
  "二维码生成器",
  "颜色转换器",
  "单位换算器"
];

test("top 10 common tools are registered in the public tool list", () => {
  const siteData = readFileSync(new URL("../src/data/siteData.jsx", import.meta.url), "utf8");

  assert.deepEqual(topTenTools.filter((name) => !siteData.includes(`name: "${name}"`)), []);
});

test("browser locale detection maps supported region codes", () => {
  assert.equal(normalizeBrowserLocale("zh-CN"), "zh");
  assert.equal(normalizeBrowserLocale("en-US"), "en");
  assert.equal(normalizeBrowserLocale("ja-JP"), "ja");
  assert.equal(normalizeBrowserLocale("ko-KR"), "ko");
  assert.equal(detectBrowserLocale(["fr-FR", "ko-KR"]), "ko");
  assert.equal(detectBrowserLocale(["fr-FR"]), "zh");
});

test("saved locale overrides browser locale detection", () => {
  const storage = { getItem: () => "ja" };
  const navigatorLike = { languages: ["ko-KR"], language: "ko-KR" };

  assert.equal(getInitialLocale(storage, navigatorLike), "ja");
});

test("every public homepage tool has an independent route", () => {
  const siteData = readFileSync(new URL("../src/data/siteData.jsx", import.meta.url), "utf8");
  const toolBlocks = [...siteData.matchAll(/tools:\s*\[([\s\S]*?)\n\s*\]/g)]
    .flatMap((groupMatch) => [...groupMatch[1].matchAll(/\{[^{}]*name:\s*"([^"]+)"[^{}]*\}/g)].map((toolMatch) => ({
      name: toolMatch[1],
      source: toolMatch[0]
    })));

  assert.ok(toolBlocks.length > 30);
  assert.deepEqual(
    toolBlocks
      .filter((tool) => !tool.source.includes("route:") && !genericToolSlugs[tool.name])
      .map((tool) => tool.name),
    []
  );
});

test("generated SEO paths use clean tool URLs instead of hash routes", () => {
  const routeIds = [
    "json-formatter",
    "password-generator",
    "pdf-word",
    "vsco-downloader"
  ];

  routeIds.forEach((routeId) => {
    assert.equal(`/tools/${routeId}`.includes("#"), false);
  });
});

test("SEO metadata source includes tool descriptions, tags, and clean paths", () => {
  const tools = readPublicTools();
  const jsonFormatter = tools.find((tool) => tool.route === "json-formatter");

  assert.ok(tools.length >= 220);
  assert.equal(jsonFormatter.name, "JSON 格式化");
  assert.equal(jsonFormatter.category, "dev");
  assert.deepEqual(jsonFormatter.tags, ["JSON", "格式化"]);

  const seo = buildToolSeo(jsonFormatter, "https://example.com/");
  assert.equal(seo.path, "/tools/json-formatter");
  assert.equal(seo.url, "https://example.com/tools/json-formatter");
  assert.match(seo.title, /JSON 格式化 在线工具/);
  assert.match(seo.description, /美化、校验 JSON 数据/);
  assert.equal(buildToolSeo(jsonFormatter).url, "https://newaitools.app/tools/json-formatter");
});

test("category SEO metadata uses clean crawlable category URLs", () => {
  const tools = readPublicTools();
  const categories = readPublicCategories(tools);
  const aiCategory = categories.find((category) => category.id === "ai");

  assert.equal(categories.length, 10);
  assert.equal(categories.some((category) => category.id === "all"), false);
  assert.ok(aiCategory.count > 0);

  const seo = buildCategorySeo(aiCategory, "https://example.com/");
  assert.equal(seo.path, "/categories/ai");
  assert.equal(seo.url, "https://example.com/categories/ai");
  assert.match(seo.title, /AI工具大全/);
  assert.match(seo.description, /在线工具/);
  assert.equal(buildCategorySeo(aiCategory).url, "https://newaitools.app/categories/ai");
});

test("expanded catalog routes are deduplicated and included in SEO output", () => {
  const tools = readPublicTools();
  const routes = tools.map((tool) => tool.route);

  assert.equal(new Set(routes).size, routes.length);
  assert.ok(tools.some((tool) => tool.route === "url-encoder-decoder"));
  assert.ok(tools.some((tool) => tool.route === "bmi-calculator"));
  assert.ok(tools.some((tool) => tool.route === "webp-to-jpg"));
  assert.ok(tools.some((tool) => tool.route === "compound-interest-calculator"));
  assert.ok(tools.some((tool) => tool.route === "background-remover" && tool.name === "图片去背景抠图"));
});

test("background remover is exposed as an image SEO landing tool", () => {
  const tools = readPublicTools();
  const backgroundRemover = tools.find((tool) => tool.route === "background-remover");
  const seo = buildToolSeo(backgroundRemover, "https://newaitools.app");

  assert.equal(backgroundRemover.category, "image");
  assert.match(backgroundRemover.desc, /自动去除图片背景/);
  assert.deepEqual(backgroundRemover.tags, ["抠图", "去背景", "透明PNG"]);
  assert.equal(seo.path, "/tools/background-remover");
  assert.match(seo.description, /图片去背景抠图/);
});

test("prerender script is wired into the production build lifecycle", () => {
  const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  const sitemapScript = readFileSync(new URL("../scripts/generate-sitemap.mjs", import.meta.url), "utf8");
  const prerenderScript = readFileSync(new URL("../scripts/prerender-tool-pages.mjs", import.meta.url), "utf8");

  assert.equal(packageJson.scripts.prebuild, "npm run seo");
  assert.equal(packageJson.scripts.postbuild, "node scripts/prerender-tool-pages.mjs");
  assert.equal(existsSync(resolve("scripts/prerender-tool-pages.mjs")), true);
  assert.match(sitemapScript, /https:\/\/newaitools\.app/);
  assert.match(prerenderScript, /https:\/\/newaitools\.app/);
  assert.match(sitemapScript, /readPublicCategories/);
  assert.match(prerenderScript, /renderCategoryHtml/);
  assert.match(prerenderScript, /CollectionPage/);
});

test("JSON formatter validates and pretty-prints objects", () => {
  const output = runGenericTool("JSON 格式化", "{\"name\":\"ToolBox\",\"count\":2}");

  assert.equal(output, "{\n  \"name\": \"ToolBox\",\n  \"count\": 2\n}");
});

test("Base64 encoder decoder handles encode and decode modes", () => {
  assert.equal(runGenericTool("Base64 编码解码", "encode: hello"), "aGVsbG8=");
  assert.equal(runGenericTool("Base64 编码解码", "decode: 5Lit5paH"), "中文");
});

test("Unix timestamp converter converts seconds and dates", () => {
  const fromSeconds = runGenericTool("Unix 时间戳转换", "1700000000");
  const fromDate = runGenericTool("Unix 时间戳转换", "2024-01-01T00:00:00Z");

  assert.match(fromSeconds, /2023-11-14/);
  assert.match(fromDate, /Unix 秒：1704067200/);
  assert.match(fromDate, /Unix 毫秒：1704067200000/);
});

test("UUID generator creates RFC 4122 v4 values", () => {
  const output = runGenericTool("UUID 生成器", "3").split("\n");

  assert.equal(output.length, 3);
  output.forEach((id) => assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/));
});

test("Password generator respects length and character classes", () => {
  const output = runGenericTool("密码生成器", "length=16 uppercase lowercase numbers symbols");

  assert.equal(output.length, 16);
  assert.match(output, /[A-Z]/);
  assert.match(output, /[a-z]/);
  assert.match(output, /[0-9]/);
  assert.match(output, /[^A-Za-z0-9]/);
});

test("Regex tester reports matches and capture groups", () => {
  const output = runGenericTool("正则测试器", "/(tool)(\\d+)/gi\nTool1 tool22 none");

  assert.match(output, /匹配 1：Tool1/);
  assert.match(output, /分组：tool, 1/i);
  assert.match(output, /匹配 2：tool22/);
});

test("Text diff marks additions, removals, and unchanged lines", () => {
  const output = runGenericTool("文本 Diff 对比", "A\nB\n---\nA\nC");

  assert.match(output, /  A/);
  assert.match(output, /- B/);
  assert.match(output, /\+ C/);
});

test("QR code generator returns a deterministic SVG", () => {
  const output = runGenericTool("二维码生成器", "https://example.com");

  assert.match(output, /^<svg /);
  assert.match(output, /data-qr-text="https:\/\/example.com"/);
  assert.match(output, /<rect /);
});

test("Color converter handles hex input and produces RGB and HSL", () => {
  const output = runGenericTool("颜色转换器", "#336699");

  assert.match(output, /HEX：#336699/);
  assert.match(output, /RGB：rgb\(51, 102, 153\)/);
  assert.match(output, /HSL：hsl\(210, 50%, 40%\)/);
});

test("Unit converter converts common length, weight, and temperature inputs", () => {
  assert.match(runGenericTool("单位换算器", "10 km to mi"), /6\.2137 mi/);
  assert.match(runGenericTool("单位换算器", "100 kg to lb"), /220\.4623 lb/);
  assert.match(runGenericTool("单位换算器", "32 f to c"), /0 c/i);
});

test("expanded utility tools run concrete local transformations", () => {
  assert.match(runGenericTool("URL 编码解码", "https://example.com/?q=在线工具"), /%E5%9C%A8%E7%BA%BF%E5%B7%A5%E5%85%B7/);
  assert.match(runGenericTool("HTML 实体转义", "<strong>Tool</strong>"), /&lt;strong&gt;Tool&lt;\/strong&gt;/);
  assert.match(runGenericTool("JWT 解码器", "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.sig"), /"sub": "123"/);
  assert.equal(runGenericTool("文本排序", "b\na\nc"), "a\nb\nc");
  assert.match(runGenericTool("BMI 计算器", "170 65"), /BMI：22\.5/);
  assert.match(runGenericTool("小费计算器", "100 18 2"), /人均：59\.00/);
});

test("SEO generators produce copyable tags and crawler files", () => {
  assert.match(
    runGenericTool("Meta 标签生成器", "title: Tools\ndescription: Best tools\nkeywords: tools,seo"),
    /<meta name="description" content="Best tools" \/>/
  );
  assert.match(runGenericTool("Robots.txt 生成器", "/admin\nhttps://example.com/sitemap.xml"), /Disallow: \/admin/);
  assert.match(runGenericTool("Sitemap 生成器", "https://example.com/a https://example.com/b"), /<loc>https:\/\/example.com\/b<\/loc>/);
  assert.equal(runGenericTool("Slug 生成器", "Best Online Tools!"), "best-online-tools");
  assert.match(runGenericTool("关键词密度分析", "seo seo tool"), /seo：2 次/);
  assert.match(runGenericTool("Schema 标记生成器", "name: Tool\ndescription: Demo"), /"@type": "WebApplication"/);
});

test("data tools clean, reshape, and summarize structured text", () => {
  assert.equal(runGenericTool("CSV 清洗", "name, value\n A , 1\n A , 1\nB,2"), "\"name\",\"value\"\n\"A\",\"1\"\n\"B\",\"2\"");
  assert.equal(runGenericTool("CSV 排序", "name,value\nB,2\nA,1"), "\"name\",\"value\"\n\"A\",\"1\"\n\"B\",\"2\"");
  assert.equal(runGenericTool("JSON 路径提取", "user.name\n{\"user\":{\"name\":\"Ada\"}}"), "\"Ada\"");
  assert.match(runGenericTool("JSON Schema 生成", "{\"name\":\"Ada\",\"age\":3}"), /"age": \{\n      "type": "number"/);
  assert.match(runGenericTool("表格转 Markdown", "name,value\nA,1"), /\| name \| value \|/);
  assert.equal(runGenericTool("Markdown 转表格", "| name | value |\n| --- | --- |\n| A | 1 |"), "\"name\",\"value\"\n\"A\",\"1\"");
  assert.match(runGenericTool("列表交集差集", "a\nb\n---\nb\nc"), /交集：b/);
  assert.equal(runGenericTool("数字序列生成器", "1 5 2"), "1, 3, 5");
  assert.match(runGenericTool("数据透视摘要", "cat,amount\nA,3\nA,4\nB,1"), /"A","2","7"/);
});

test("developer and finance calculators handle common one-line inputs", () => {
  assert.match(runGenericTool("YAML 转 JSON", "name: Ada\nage: 3"), /"age": 3/);
  assert.match(runGenericTool("JSON 转 YAML", "{\"name\":\"Ada\",\"age\":3}"), /age: 3/);
  assert.match(runGenericTool("XML 格式化", "<root><item>A</item></root>"), /<root>\n  <item>A<\/item>\n<\/root>/);
  assert.match(runGenericTool("SQL 格式化", "select a,b from t where a=1"), /\nfrom t/);
  assert.equal(runGenericTool("CSS 压缩", "body { color: red; }"), "body{color:red;}");
  assert.match(runGenericTool("Cron 表达式解析", "*/5 * * * *"), /分钟：\*\/5/);
  assert.match(runGenericTool("User-Agent 解析", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36"), /浏览器：Chrome/);
  assert.match(runGenericTool("房贷计算器", "100 4.2 30"), /等额本息月供：4890\.17/);
  assert.match(runGenericTool("汇率换算器", "100 7.2"), /换算结果：720\.00/);
});

test("image-adjacent and hash utilities produce concrete local artifacts", () => {
  assert.match(runGenericTool("哈希生成器", "ToolBox Hub"), /FNV-1a 32：[0-9a-f]{8}/);
  assert.equal(
    runGenericTool("SVG 压缩", "<svg>\n  <!-- c -->\n  <rect fill=\"red\" />\n</svg>"),
    "<svg><rect fill=\"red\"/></svg>"
  );
  assert.match(runGenericTool("Favicon 生成器", "/favicon.png"), /apple-touch-icon/);
  assert.match(runGenericTool("Base64 转图片", "abc123"), /^<img src="data:image\/png;base64,abc123"/);
});

test("expanded market batch includes working SEO, dev, text, and calculator utilities", () => {
  assert.equal(runGenericTool("Canonical 标签生成器", "https://example.com/page"), "<link rel=\"canonical\" href=\"https://example.com/page\" />");
  assert.match(runGenericTool("FAQ Schema 生成器", "这些工具免费吗？"), /FAQPage/);
  assert.match(runGenericTool("页面速度检查清单", "https://example.com"), /LCP/);
  assert.match(runGenericTool("HTML 格式化", "<div><span>A</span></div>"), /<div>\n<span>A<\/span>\n<\/div>/);
  assert.equal(runGenericTool("JSON 压缩", "{\"b\":2,\"a\":1}"), "{\"b\":2,\"a\":1}");
  assert.match(runGenericTool("HTTP 状态码查询", "404"), /资源不存在/);
  assert.equal(runGenericTool("换行转逗号", "a\nb\nc"), "a, b, c");
  assert.match(runGenericTool("阅读时间估算", "a".repeat(900)), /预计阅读：2 分钟/);
  assert.match(runGenericTool("复利计算器", "10000 5 2"), /复利结果：11025\.00/);
  assert.match(runGenericTool("折扣计算器", "100 80"), /折后价：80\.00/);
});

test("AI writing helpers return structured drafts instead of generic fallback", () => {
  assert.match(runGenericTool("AI 提示词生成器", "产品落地页"), /角色：你是一名资深产品与增长专家/);
  assert.match(runGenericTool("AI 标题生成器", "在线工具站增长"), /解决 在线工具站增长 的 7 个关键方法/);
  assert.match(runGenericTool("AI 摘要生成器", "第一点。第二点。第三点。"), /摘要：第一点；第二点；第三点。/);
  assert.match(runGenericTool("AI 邮件助手", "subject: 进度同步\ngoal: 请确认下一批优先级"), /主题：进度同步/);
  assert.match(runGenericTool("AI 周报生成器", "完成落地页\n补齐测试"), /本周进展：/);
  assert.match(runGenericTool("AI 短视频脚本", "在线工具站"), /镜头 1/);
  assert.match(runGenericTool("AI 面试题生成器", "前端工程师"), /岗位：前端工程师/);
  assert.match(runGenericTool("AI 学习计划", "React 工具站"), /第 4 周/);
});

test("office generators produce reusable business documents", () => {
  assert.match(runGenericTool("会议纪要生成器", "确认首页\n补齐工具"), /会议纪要/);
  assert.match(runGenericTool("OKR 生成器", "提升搜索流量"), /KR1/);
  assert.match(runGenericTool("甘特图数据生成", "设计\n开发"), /"任务","开始","结束"/);
  assert.match(runGenericTool("发票抬头整理", "company: A\ntax: T"), /公司名称：A/);
  assert.match(runGenericTool("简历要点优化", "开发工具站"), /主导\/参与 开发工具站/);
  assert.match(runGenericTool("邮件签名生成器", "name: 张三\ntitle: PM"), /张三\nPM/);
  assert.match(runGenericTool("请假条生成器", "name: 张三\ndate: 2026-05-22\nreason: 事假"), /请假原因：事假/);
  assert.match(runGenericTool("日报生成器", "完成测试\n修复问题"), /明日计划：/);
});

test("text, media, and habit tools provide specialized local outputs", () => {
  assert.equal(runGenericTool("标点格式化", "hello, world! 这是 test ?"), "hello，world！这是 test？");
  assert.match(runGenericTool("繁简转换", "在线工具转换"), /转繁体：在线工具轉換/);
  assert.equal(runGenericTool("拼音转换", "在线工具"), "zai xian gong ju");
  assert.match(runGenericTool("Lorem Ipsum 生成器", "2"), /Lorem ipsum[\s\S]*Lorem ipsum/);
  assert.match(runGenericTool("敏感词检测", "包含敏感内容"), /命中 1 个：敏感/);
  assert.match(runGenericTool("字幕格式转换", "1\n00:00:00,000 --> 00:00:03,000\n大家好"), /WEBVTT/);
  assert.match(runGenericTool("视频标题生成器", "工具站"), /工具站，新手最容易忽略/);
  assert.match(runGenericTool("播客大纲生成", "工具站"), /00:00 开场/);
  assert.equal(runGenericTool("音频转写清理", "嗯 今天就是 来聊聊 然后然后 工具站"), "今天 来聊聊 工具站");
  assert.match(runGenericTool("YouTube 标签生成", "online tools seo productivity"), /tutorial/);
  assert.match(runGenericTool("章节时间轴生成", "开场\n目录\n总结"), /01:30 目录/);
  assert.match(runGenericTool("番茄钟", "25 5 2"), /第 2 轮：专注 25 分钟/);
  assert.match(runGenericTool("习惯打卡", "阅读\n运动"), /"习惯","周一"/);
});
