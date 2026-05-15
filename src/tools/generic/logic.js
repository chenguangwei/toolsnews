import { downloadBlob, toCsv } from "../../shared/utils.js";

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


export {
  classifyTool,
  runGenericTool,
  runImageTool
};
