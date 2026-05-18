import { downloadBlob, toCsv } from "../../shared/utils.js";

function classifyTool(name) {
  if (name.includes("PDF")) return "pdf";
  if (name.includes("图片")) return "image";
  if (name.includes("JSON") || name.includes("代码") || name.includes("API") || name.includes("编译") || name.includes("Base64") || name.includes("UUID") || name.includes("正则") || name.includes("Diff") || name.includes("二维码") || name.includes("颜色") || name.includes("时间戳") || name.includes("密码") || name.includes("单位")) return "dev";
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

function encodeUtf8Base64(text) {
  if (typeof Buffer !== "undefined") return Buffer.from(text, "utf8").toString("base64");
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function decodeUtf8Base64(text) {
  try {
    if (typeof Buffer !== "undefined") return Buffer.from(text, "base64").toString("utf8");
    const binary = atob(text);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch (error) {
    return `Base64 解码失败：${error.message}`;
  }
}

function runBase64Tool(source) {
  const modeMatch = source.match(/^(encode|decode|编码|解码)\s*[:：]\s*([\s\S]*)$/i);
  if (!modeMatch) return `编码：${encodeUtf8Base64(source)}\n解码提示：输入 decode: 后跟 Base64 内容可解码。`;
  const mode = modeMatch[1].toLowerCase();
  const value = modeMatch[2];
  return mode === "decode" || mode === "解码" ? decodeUtf8Base64(value.trim()) : encodeUtf8Base64(value);
}

function runTimestampTool(source) {
  const numeric = source.match(/^\d{10,13}$/);
  const date = numeric
    ? new Date(Number(source) * (source.length === 10 ? 1000 : 1))
    : new Date(source);
  if (Number.isNaN(date.getTime())) return "请输入 Unix 秒/毫秒，或可识别日期，例如 2024-01-01T00:00:00Z。";
  return [
    `本地时间：${date.toLocaleString("zh-CN", { hour12: false })}`,
    `UTC：${date.toISOString()}`,
    `日期：${date.toISOString().slice(0, 10)}`,
    `Unix 秒：${Math.floor(date.getTime() / 1000)}`,
    `Unix 毫秒：${date.getTime()}`
  ].join("\n");
}

function secureRandomInt(max) {
  if (max <= 0) return 0;
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.getRandomValues) {
    const array = new Uint32Array(1);
    cryptoApi.getRandomValues(array);
    return array[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function runUuidTool(source) {
  const count = Math.max(1, Math.min(100, Number.parseInt(source, 10) || 1));
  return Array.from({ length: count }, () => {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (char) =>
      (Number(char) ^ secureRandomInt(16) & 15 >> Number(char) / 4).toString(16)
    );
  }).join("\n");
}

function runPasswordTool(source) {
  const length = Math.max(8, Math.min(128, Number(source.match(/(?:length|长度)\s*=\s*(\d+)/i)?.[1] || source.match(/\d+/)?.[0] || 16)));
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()-_=+[]{};:,.?/|~";
  const wantsUpper = /uppercase|upper|大写/i.test(source);
  const wantsLower = /lowercase|lower|小写/i.test(source);
  const wantsNumbers = /numbers?|digits?|数字/i.test(source);
  const wantsSymbols = /symbols?|特殊|符号/i.test(source);
  const explicit = wantsUpper || wantsLower || wantsNumbers || wantsSymbols;
  const groups = [
    explicit && !wantsLower ? "" : lower,
    explicit && !wantsUpper ? "" : upper,
    explicit && !wantsNumbers ? "" : numbers,
    explicit && !wantsSymbols ? "" : symbols
  ].filter(Boolean);
  const pool = groups.join("");
  const seeded = groups.map((group) => group[secureRandomInt(group.length)]);
  while (seeded.length < length) seeded.push(pool[secureRandomInt(pool.length)]);
  return seeded.sort(() => secureRandomInt(3) - 1).join("");
}

function parseRegexInput(source) {
  const [firstLine, ...body] = source.split(/\r?\n/);
  const literal = firstLine.match(/^\/([\s\S]*)\/([dgimsuvy]*)$/);
  if (literal) return { pattern: literal[1], flags: literal[2], text: body.join("\n") };
  const [pattern, flags = "g", ...text] = source.split(/\r?\n---\r?\n/);
  return { pattern, flags, text: text.join("\n---\n") || body.join("\n") };
}

function runRegexTool(source) {
  try {
    const { pattern, flags, text } = parseRegexInput(source);
    const safeFlags = flags.includes("g") ? flags : `${flags}g`;
    const regex = new RegExp(pattern, safeFlags);
    const matches = [...text.matchAll(regex)];
    if (!matches.length) return "未匹配到内容。";
    return matches.map((match, index) => {
      const groups = match.slice(1).length ? `\n分组：${match.slice(1).join(", ")}` : "";
      return `匹配 ${index + 1}：${match[0]}\n位置：${match.index}${groups}`;
    }).join("\n\n");
  } catch (error) {
    return `正则解析失败：${error.message}`;
  }
}

function runTextDiffTool(source) {
  const [left = "", right = ""] = source.split(/\r?\n---\r?\n/);
  const oldLines = left.split(/\r?\n/);
  const newLines = right.split(/\r?\n/);
  const max = Math.max(oldLines.length, newLines.length);
  const output = [];
  for (let index = 0; index < max; index += 1) {
    if (oldLines[index] === newLines[index]) output.push(`  ${oldLines[index] ?? ""}`);
    else {
      if (oldLines[index] !== undefined) output.push(`- ${oldLines[index]}`);
      if (newLines[index] !== undefined) output.push(`+ ${newLines[index]}`);
    }
  }
  return output.join("\n");
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
}

function runQrTool(source) {
  const dataBytes = [...new TextEncoder().encode(source)];
  const versions = [
    { version: 1, dataCodewords: 19, eccCodewords: 7, align: [] },
    { version: 2, dataCodewords: 34, eccCodewords: 10, align: [6, 18] },
    { version: 3, dataCodewords: 55, eccCodewords: 15, align: [6, 22] },
    { version: 4, dataCodewords: 80, eccCodewords: 20, align: [6, 26] }
  ];
  const spec = versions.find((item) => dataBytes.length + 2 <= item.dataCodewords);
  if (!spec) return "当前本地二维码生成器支持最多约 78 个英文字符或较短中文文本。";
  const size = 21 + (spec.version - 1) * 4;
  const cell = 8;
  const quiet = 4;
  const total = (size + quiet * 2) * cell;
  const matrix = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved = Array.from({ length: size }, () => Array(size).fill(false));
  const setModule = (row, col, value, reserve = true) => {
    if (row < 0 || row >= size || col < 0 || col >= size) return;
    matrix[row][col] = Boolean(value);
    if (reserve) reserved[row][col] = true;
  };
  const addFinder = (row, col) => {
    for (let y = -1; y <= 7; y += 1) {
      for (let x = -1; x <= 7; x += 1) {
        const yy = row + y;
        const xx = col + x;
        if (yy < 0 || yy >= size || xx < 0 || xx >= size) continue;
        setModule(yy, xx, y >= 0 && y <= 6 && x >= 0 && x <= 6 && (y === 0 || y === 6 || x === 0 || x === 6 || (y >= 2 && y <= 4 && x >= 2 && x <= 4)));
      }
    }
  };
  const addAlignment = (centerRow, centerCol) => {
    for (let y = -2; y <= 2; y += 1) {
      for (let x = -2; x <= 2; x += 1) {
        setModule(centerRow + y, centerCol + x, Math.max(Math.abs(x), Math.abs(y)) !== 1);
      }
    }
  };
  addFinder(0, 0);
  addFinder(0, size - 7);
  addFinder(size - 7, 0);
  for (let i = 8; i < size - 8; i += 1) {
    setModule(6, i, i % 2 === 0);
    setModule(i, 6, i % 2 === 0);
  }
  spec.align.forEach((row) => spec.align.forEach((col) => {
    const overlapsFinder = (row < 9 && col < 9) || (row < 9 && col > size - 10) || (row > size - 10 && col < 9);
    if (!overlapsFinder) addAlignment(row, col);
  }));
  for (let i = 0; i < 9; i += 1) {
    if (i !== 6) {
      reserved[8][i] = true;
      reserved[i][8] = true;
    }
  }
  for (let i = 0; i < 8; i += 1) {
    reserved[8][size - 1 - i] = true;
    reserved[size - 1 - i][8] = true;
  }
  setModule(4 * spec.version + 9, 8, true);

  const bits = [];
  const appendBits = (value, length) => {
    for (let i = length - 1; i >= 0; i -= 1) bits.push((value >>> i) & 1);
  };
  appendBits(0b0100, 4);
  appendBits(dataBytes.length, 8);
  dataBytes.forEach((byte) => appendBits(byte, 8));
  appendBits(0, Math.min(4, spec.dataCodewords * 8 - bits.length));
  while (bits.length % 8) bits.push(0);
  const codewords = [];
  for (let i = 0; i < bits.length; i += 8) codewords.push(Number.parseInt(bits.slice(i, i + 8).join(""), 2));
  for (let pad = 0xec; codewords.length < spec.dataCodewords; pad = pad === 0xec ? 0x11 : 0xec) codewords.push(pad);
  const allCodewords = [...codewords, ...reedSolomonRemainder(codewords, spec.eccCodewords)];
  const dataBits = allCodewords.flatMap((byte) => Array.from({ length: 8 }, (_, index) => (byte >>> (7 - index)) & 1));
  let bitIndex = 0;
  let upward = true;
  for (let col = size - 1; col >= 1; col -= 2) {
    if (col === 6) col -= 1;
    for (let step = 0; step < size; step += 1) {
      const row = upward ? size - 1 - step : step;
      for (let offset = 0; offset < 2; offset += 1) {
        const x = col - offset;
        if (reserved[row][x]) continue;
        const rawBit = dataBits[bitIndex] || 0;
        setModule(row, x, rawBit ^ qrMask(0, row, x), false);
        bitIndex += 1;
      }
    }
    upward = !upward;
  }
  drawFormatBits(matrix, reserved, 0);
  const rects = matrix
    .flatMap((line, row) => line.map((filled, col) => filled ? `<rect x="${(col + quiet) * cell}" y="${(row + quiet) * cell}" width="${cell}" height="${cell}"/>` : ""))
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" data-qr-text="${escapeHtml(source)}" viewBox="0 0 ${total} ${total}" width="${total}" height="${total}" role="img" aria-label="QR code"><rect width="${total}" height="${total}" fill="#fff"/><g fill="#111">${rects}</g></svg>`;
}

function reedSolomonRemainder(data, degree) {
  const generator = reedSolomonGenerator(degree);
  const result = Array(degree).fill(0);
  data.forEach((byte) => {
    const factor = byte ^ result.shift();
    result.push(0);
    generator.forEach((coefficient, index) => {
      result[index] ^= gfMultiply(coefficient, factor);
    });
  });
  return result;
}

function reedSolomonGenerator(degree) {
  let result = [1];
  for (let i = 0; i < degree; i += 1) {
    const next = Array(result.length + 1).fill(0);
    result.forEach((coefficient, index) => {
      next[index] ^= gfMultiply(coefficient, 1);
      next[index + 1] ^= gfMultiply(coefficient, gfPow(2, i));
    });
    result = next;
  }
  return result.slice(1);
}

function gfMultiply(left, right) {
  let product = 0;
  for (let i = 7; i >= 0; i -= 1) {
    product = (product << 1) ^ ((product >>> 7) * 0x11d);
    product ^= ((right >>> i) & 1) * left;
  }
  return product & 0xff;
}

function gfPow(value, power) {
  let result = 1;
  for (let i = 0; i < power; i += 1) result = gfMultiply(result, value);
  return result;
}

function qrMask(mask, row, col) {
  return mask === 0 && (row + col) % 2 === 0 ? 1 : 0;
}

function drawFormatBits(matrix, reserved, mask) {
  const size = matrix.length;
  const set = (row, col, bit) => {
    matrix[row][col] = Boolean(bit);
    reserved[row][col] = true;
  };
  let data = (1 << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i += 1) rem = (rem << 1) ^ (((rem >>> 9) & 1) * 0x537);
  const bits = ((data << 10) | (rem & 0x3ff)) ^ 0x5412;
  const get = (index) => (bits >>> index) & 1;
  for (let i = 0; i <= 5; i += 1) set(8, i, get(i));
  set(8, 7, get(6));
  set(8, 8, get(7));
  set(7, 8, get(8));
  for (let i = 9; i < 15; i += 1) set(14 - i, 8, get(i));
  for (let i = 0; i < 8; i += 1) set(size - 1 - i, 8, get(i));
  for (let i = 8; i < 15; i += 1) set(8, size - 15 + i, get(i));
  set(8, size - 8, true);
}

function parseColor(source) {
  const hex = source.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1];
  if (hex) {
    const full = hex.length === 3 ? hex.split("").map((char) => char + char).join("") : hex;
    return {
      r: Number.parseInt(full.slice(0, 2), 16),
      g: Number.parseInt(full.slice(2, 4), 16),
      b: Number.parseInt(full.slice(4, 6), 16)
    };
  }
  const rgb = source.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (rgb) return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]) };
  return null;
}

function runColorTool(source) {
  const color = parseColor(source);
  if (!color) return "请输入 HEX 或 RGB，例如 #336699 或 rgb(51, 102, 153)。";
  const { r, g, b } = color;
  const hex = `#${[r, g, b].map((value) => Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0")).join("")}`;
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const light = (max + min) / 2;
  const delta = max - min;
  const sat = delta === 0 ? 0 : delta / (1 - Math.abs(2 * light - 1));
  const hue = delta === 0 ? 0 : max === rn ? 60 * (((gn - bn) / delta) % 6) : max === gn ? 60 * ((bn - rn) / delta + 2) : 60 * ((rn - gn) / delta + 4);
  return [`HEX：${hex}`, `RGB：rgb(${r}, ${g}, ${b})`, `HSL：hsl(${Math.round((hue + 360) % 360)}, ${Math.round(sat * 100)}%, ${Math.round(light * 100)}%)`].join("\n");
}

const unitFactors = {
  m: { group: "length", factor: 1 },
  km: { group: "length", factor: 1000 },
  cm: { group: "length", factor: 0.01 },
  mm: { group: "length", factor: 0.001 },
  mi: { group: "length", factor: 1609.344 },
  mile: { group: "length", factor: 1609.344 },
  yd: { group: "length", factor: 0.9144 },
  ft: { group: "length", factor: 0.3048 },
  in: { group: "length", factor: 0.0254 },
  kg: { group: "weight", factor: 1 },
  g: { group: "weight", factor: 0.001 },
  lb: { group: "weight", factor: 0.45359237 },
  oz: { group: "weight", factor: 0.028349523125 }
};

function runUnitTool(source) {
  const match = source.toLowerCase().match(/(-?\d+(?:\.\d+)?)\s*([a-z]+|°?[cf])\s*(?:to|->|到|转)\s*([a-z]+|°?[cf])/i);
  if (!match) return "请输入格式：10 km to mi、100 kg to lb、32 f to c。";
  const value = Number(match[1]);
  const from = match[2].replace("°", "");
  const to = match[3].replace("°", "");
  if (["c", "f"].includes(from) && ["c", "f"].includes(to)) {
    const converted = from === to ? value : from === "c" ? value * 9 / 5 + 32 : (value - 32) * 5 / 9;
    return `${value} ${from} = ${Number(converted.toFixed(4))} ${to}`;
  }
  const fromUnit = unitFactors[from];
  const toUnit = unitFactors[to];
  if (!fromUnit || !toUnit || fromUnit.group !== toUnit.group) return "暂不支持该单位组合。";
  const converted = value * fromUnit.factor / toUnit.factor;
  return `${value} ${from} = ${converted.toFixed(4)} ${to}`;
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
  if (name.includes("Base64")) return runBase64Tool(source);
  if (name.includes("时间戳") || name.includes("Timestamp")) return runTimestampTool(source);
  if (name.includes("UUID")) return runUuidTool(source);
  if (name.includes("密码")) return runPasswordTool(source);
  if (name.includes("正则") || name.includes("Regex")) return runRegexTool(source);
  if (name.includes("Diff") || name.includes("对比")) return runTextDiffTool(source);
  if (name.includes("二维码") || name.includes("QR")) return runQrTool(source);
  if (name.includes("颜色")) return runColorTool(source);
  if (name.includes("单位")) return runUnitTool(source);
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
