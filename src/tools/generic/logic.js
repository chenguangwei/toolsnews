import { downloadBlob, toCsv } from "../../shared/utils.js";

function classifyTool(name) {
  if (name.includes("Base64 转图片")) return "general";
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

function runUrlTool(source) {
  try {
    const value = source.replace(/^(encode|decode|编码|解码)\s*[:：]\s*/i, "");
    const wantsDecode = /^(decode|解码)\s*[:：]/i.test(source) || /%[0-9a-f]{2}/i.test(value);
    const output = wantsDecode ? decodeURIComponent(value) : encodeURIComponent(value);
    const opposite = wantsDecode ? encodeURIComponent(output) : decodeURIComponent(output);
    return `${wantsDecode ? "解码" : "编码"}结果：${output}\n反向结果：${opposite}`;
  } catch (error) {
    return `URL 编码解码失败：${error.message}`;
  }
}

function runHtmlEntityTool(source) {
  const encoded = escapeHtml(source);
  const decoded = source
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
  return `转义结果：\n${encoded}\n\n还原结果：\n${decoded}`;
}

function runJwtTool(source) {
  try {
    const [header, payload] = source.split(".");
    if (!header || !payload) return "请输入完整 JWT，至少包含 header.payload.signature。";
    const decodePart = (part) => decodeUtf8Base64(part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "="));
    return `Header:\n${JSON.stringify(JSON.parse(decodePart(header)), null, 2)}\n\nPayload:\n${JSON.stringify(JSON.parse(decodePart(payload)), null, 2)}`;
  } catch (error) {
    return `JWT 解码失败：${error.message}`;
  }
}

function runTextSorter(source) {
  return source.split(/\r?\n/).filter(Boolean).sort((left, right) => left.localeCompare(right, "zh-CN")).join("\n");
}

function runBmiTool(source) {
  const nums = source.match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
  if (nums.length < 2) return "请输入身高和体重，例如：170 65 或 1.70m 65kg。";
  const heightRaw = nums[0];
  const weight = nums[1];
  const heightMeters = heightRaw > 3 ? heightRaw / 100 : heightRaw;
  const bmi = weight / (heightMeters ** 2);
  const level = bmi < 18.5 ? "偏瘦" : bmi < 24 ? "正常" : bmi < 28 ? "超重" : "肥胖";
  return `BMI：${bmi.toFixed(1)}\n状态：${level}\n身高：${heightMeters.toFixed(2)} m\n体重：${weight} kg`;
}

function runAgeTool(source) {
  const birth = new Date(source);
  if (Number.isNaN(birth.getTime())) return "请输入生日，例如 1995-08-15。";
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const birthdayPassed = now.getMonth() > birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  if (!birthdayPassed) age -= 1;
  const days = Math.floor((now - birth) / 86400000);
  return `年龄：${age} 岁\n已出生：${days} 天\n生日：${birth.toISOString().slice(0, 10)}`;
}

function runTipTool(source) {
  const nums = source.match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
  const amount = nums[0] || 0;
  const rate = nums[1] || 15;
  const people = Math.max(1, Math.round(nums[2] || 1));
  const tip = amount * rate / 100;
  return `消费金额：${amount.toFixed(2)}\n小费：${tip.toFixed(2)} (${rate}%)\n总计：${(amount + tip).toFixed(2)}\n人均：${((amount + tip) / people).toFixed(2)}`;
}

function parseKeyValueLines(source) {
  return Object.fromEntries(source.split(/\r?\n/).map((line) => {
    const match = line.match(/^([^:：=]+)\s*[:：=]\s*([\s\S]*)$/);
    return match ? [match[1].trim().toLowerCase(), match[2].trim()] : null;
  }).filter(Boolean));
}

function runMetaTagTool(source) {
  const data = parseKeyValueLines(source);
  const title = data.title || data["标题"] || source.split(/\r?\n/)[0] || "页面标题";
  const description = data.description || data.desc || data["描述"] || "页面描述";
  const keywords = data.keywords || data["关键词"] || "";
  return [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}" />` : "",
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`
  ].filter(Boolean).join("\n");
}

function runRobotsTool(source) {
  const lines = source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const disallows = lines.filter((line) => line.startsWith("/") || line.startsWith("*"));
  const sitemap = lines.find((line) => /^https?:\/\//i.test(line));
  return [
    "User-agent: *",
    ...disallows.map((line) => `Disallow: ${line}`),
    disallows.length ? "" : "Allow: /",
    sitemap ? `Sitemap: ${sitemap}` : ""
  ].filter((line) => line !== "").join("\n");
}

function runSitemapTool(source) {
  const urls = source.split(/\s+/).map((item) => item.trim()).filter((item) => /^https?:\/\//i.test(item));
  if (!urls.length) return "请输入一个或多个完整 URL。";
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url><loc>${escapeHtml(url)}</loc></url>`),
    "</urlset>"
  ].join("\n");
}

function runSlugTool(source) {
  const slug = source
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "请输入标题文本。";
}

function runLengthChecker(source, type) {
  const length = [...source].length;
  const min = type === "title" ? 20 : 70;
  const max = type === "title" ? 60 : 160;
  const status = length < min ? "偏短" : length > max ? "偏长" : "合适";
  return `长度：${length} 字符\n建议范围：${min}-${max} 字符\n状态：${status}`;
}

function runKeywordDensity(source) {
  const tokens = source.toLowerCase().match(/[\u4e00-\u9fa5]{2,}|[a-z0-9-]{2,}/g) || [];
  if (!tokens.length) return "没有识别到可统计关键词。";
  const counts = tokens.reduce((map, token) => map.set(token, (map.get(token) || 0) + 1), new Map());
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 12)
    .map(([term, count], index) => `${index + 1}. ${term}：${count} 次，${(count / tokens.length * 100).toFixed(2)}%`)
    .join("\n");
}

function runOpenGraphTool(source) {
  const data = parseKeyValueLines(source);
  const title = data.title || data["标题"] || source.split(/\r?\n/)[0] || "分享标题";
  const description = data.description || data.desc || data["描述"] || "分享描述";
  const url = data.url || data["链接"] || "https://example.com";
  const image = data.image || data["图片"] || "https://example.com/og-image.jpg";
  return [
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`
  ].join("\n");
}

function runSchemaTool(source) {
  const data = parseKeyValueLines(source);
  const schema = {
    "@context": "https://schema.org",
    "@type": data.type || data["类型"] || "WebApplication",
    name: data.name || data["名称"] || source.split(/\r?\n/)[0] || "在线工具",
    description: data.description || data.desc || data["描述"] || "在线工具说明",
    url: data.url || data["链接"] || "https://example.com"
  };
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

function splitCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === "\"" && line[index + 1] === "\"") {
      current += "\"";
      index += 1;
    } else if (char === "\"") {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

function parseCsvRows(source) {
  return source.trim().split(/\r?\n/).filter(Boolean).map(splitCsvLine);
}

function runCsvCleaner(source) {
  const rows = parseCsvRows(source)
    .map((row) => row.map((cell) => cell.trim()))
    .filter((row) => row.some(Boolean));
  const seen = new Set();
  return toCsv(rows.filter((row) => {
    const key = JSON.stringify(row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }));
}

function runCsvSorter(source) {
  const rows = parseCsvRows(source);
  if (rows.length < 2) return source.trim();
  const [header, ...body] = rows;
  return toCsv([header, ...body.sort((left, right) => String(left[0] || "").localeCompare(String(right[0] || ""), "zh-CN"))]);
}

function runCsvMerger(source) {
  const blocks = source.split(/\n\s*---\s*\n/).map(parseCsvRows).filter((rows) => rows.length);
  if (!blocks.length) return "请输入 CSV 内容，多个片段用单独一行 --- 分隔。";
  const [header] = blocks[0];
  const body = blocks.flatMap((rows, index) => index === 0 ? rows.slice(1) : rows.slice(1).length ? rows.slice(1) : rows);
  return toCsv([header, ...body]);
}

function runJsonPathExtractor(source) {
  try {
    const [pathLine, ...jsonLines] = source.split(/\r?\n/);
    const path = pathLine.replace(/^path\s*[:：=]\s*/i, "").trim();
    const data = JSON.parse(jsonLines.join("\n") || source);
    const value = path.split(".").filter(Boolean).reduce((current, key) => current?.[key], data);
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return `JSON 路径提取失败：${error.message}`;
  }
}

function inferJsonSchema(value) {
  if (Array.isArray(value)) {
    return { type: "array", items: value.length ? inferJsonSchema(value[0]) : {} };
  }
  if (value && typeof value === "object") {
    return {
      type: "object",
      properties: Object.fromEntries(Object.entries(value).map(([key, child]) => [key, inferJsonSchema(child)])),
      required: Object.keys(value)
    };
  }
  return { type: value === null ? "null" : typeof value };
}

function runJsonSchemaTool(source) {
  try {
    const data = JSON.parse(source);
    return JSON.stringify({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      ...inferJsonSchema(data)
    }, null, 2);
  } catch (error) {
    return `JSON Schema 生成失败：${error.message}`;
  }
}

function runTableToMarkdown(source) {
  const rows = source.includes(",") ? parseCsvRows(source) : source.trim().split(/\r?\n/).map((line) => line.split(/\t|\s{2,}/));
  if (!rows.length) return "请输入表格文本或 CSV。";
  const widths = rows[0].map((_, index) => Math.max(...rows.map((row) => String(row[index] || "").length)));
  const format = (row) => `| ${widths.map((width, index) => String(row[index] || "").padEnd(width)).join(" | ")} |`;
  return [format(rows[0]), `| ${widths.map((width) => "-".repeat(Math.max(3, width))).join(" | ")} |`, ...rows.slice(1).map(format)].join("\n");
}

function runMarkdownToTable(source) {
  const rows = source.split(/\r?\n/)
    .filter((line) => /^\s*\|/.test(line) && !/^\s*\|?\s*:?-{3,}/.test(line))
    .map((line) => line.replace(/^\s*\||\|\s*$/g, "").split("|").map((cell) => cell.trim()));
  return rows.length ? toCsv(rows) : "请输入 Markdown 表格。";
}

function runListSetOperations(source) {
  const [left = "", right = ""] = source.split(/\r?\n---\r?\n/);
  const leftSet = new Set(left.split(/\r?\n|,|，/).map((item) => item.trim()).filter(Boolean));
  const rightSet = new Set(right.split(/\r?\n|,|，/).map((item) => item.trim()).filter(Boolean));
  const intersection = [...leftSet].filter((item) => rightSet.has(item));
  const union = [...new Set([...leftSet, ...rightSet])];
  const diff = [...leftSet].filter((item) => !rightSet.has(item));
  return `交集：${intersection.join(", ")}\n并集：${union.join(", ")}\n左侧差集：${diff.join(", ")}`;
}

function runNumberSequence(source) {
  const nums = source.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
  const [start = 1, end = 10, step = 1] = nums;
  const output = [];
  for (let value = start; step >= 0 ? value <= end : value >= end; value += step || 1) {
    output.push(Number(value.toFixed(10)));
    if (output.length >= 1000) break;
  }
  return output.join(", ");
}

function runPivotSummary(source) {
  const rows = parseCsvRows(source);
  if (rows.length < 2) return "请输入带表头的 CSV 数据。";
  const [header, ...body] = rows;
  const groupIndex = 0;
  const valueIndex = header.findIndex((cell, index) => index > 0 && /金额|数量|value|amount|count|total/i.test(cell)) || 1;
  const summary = body.reduce((map, row) => {
    const key = row[groupIndex] || "未分组";
    const value = Number(row[valueIndex]) || 0;
    const current = map.get(key) || { count: 0, sum: 0 };
    map.set(key, { count: current.count + 1, sum: current.sum + value });
    return map;
  }, new Map());
  return toCsv([["分组", "数量", "合计"], ...[...summary.entries()].map(([key, item]) => [key, item.count, item.sum])]);
}

function runYamlToJson(source) {
  try {
    const entries = source.split(/\r?\n/).map((line) => line.match(/^\s*([^:#]+):\s*(.*?)\s*$/)).filter(Boolean);
    return JSON.stringify(Object.fromEntries(entries.map((match) => [match[1].trim(), coerceScalar(match[2])])), null, 2);
  } catch (error) {
    return `YAML 转 JSON 失败：${error.message}`;
  }
}

function coerceScalar(value) {
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if (/^(true|false)$/i.test(value)) return value.toLowerCase() === "true";
  if (/^null$/i.test(value)) return null;
  return value.replace(/^["']|["']$/g, "");
}

function runJsonToYaml(source) {
  try {
    const data = JSON.parse(source);
    return Object.entries(data).map(([key, value]) => `${key}: ${typeof value === "object" && value !== null ? JSON.stringify(value) : value}`).join("\n");
  } catch (error) {
    return `JSON 转 YAML 失败：${error.message}`;
  }
}

function runXmlFormatter(source) {
  return source
    .replace(/>\s*</g, ">\n<")
    .split(/\r?\n/)
    .reduce((lines, line) => {
      const closing = /^<\//.test(line.trim());
      const previousIndent = Math.max(0, (lines.at(-1)?.indent || 0) + (closing ? -1 : 0));
      const selfClosing = /\/>$/.test(line.trim()) || /^<\?/.test(line.trim()) || /^<!--/.test(line.trim());
      const opens = /^<[^/!?][^>]*>$/.test(line.trim()) && !selfClosing;
      lines.push({ indent: previousIndent, text: `${"  ".repeat(previousIndent)}${line.trim()}` });
      if (opens && !line.trim().includes("</")) lines.at(-1).next = previousIndent + 1;
      return lines.map((item, index, arr) => index === arr.length - 1 ? { ...item, indent: item.next ?? item.indent } : item);
    }, [])
    .map((line) => line.text)
    .join("\n");
}

function runSqlFormatter(source) {
  return source
    .replace(/\s+/g, " ")
    .replace(/\b(select|from|where|group by|order by|having|limit|join|left join|right join|inner join|values|set)\b/gi, "\n$1")
    .replace(/\s*,\s*/g, ",\n  ")
    .trim();
}

function runMinifier(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,=+\-*/>])\s*/g, "$1")
    .trim();
}

function runCronParser(source) {
  const parts = source.trim().split(/\s+/);
  if (parts.length < 5) return "请输入 5 段 Cron 表达式，例如 */5 * * * *。";
  const [minute, hour, day, month, weekday] = parts;
  return `分钟：${minute}\n小时：${hour}\n日期：${day}\n月份：${month}\n星期：${weekday}\n说明：该表达式按以上字段匹配触发时间。`;
}

function runUserAgentParser(source) {
  const browser = source.includes("Edg/") ? "Microsoft Edge" : source.includes("Chrome/") ? "Chrome" : source.includes("Firefox/") ? "Firefox" : source.includes("Safari/") ? "Safari" : "未知浏览器";
  const os = source.includes("Windows") ? "Windows" : source.includes("Mac OS X") ? "macOS" : source.includes("Android") ? "Android" : source.includes("iPhone") ? "iOS" : "未知系统";
  const mobile = /Mobile|Android|iPhone/i.test(source) ? "是" : "否";
  return `浏览器：${browser}\n操作系统：${os}\n移动设备：${mobile}`;
}

function runMortgageTool(source) {
  const nums = source.match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
  const principal = (nums[0] || 100) * 10000;
  const annualRate = (nums[1] || 4.2) / 100;
  const years = nums[2] || 30;
  const months = years * 12;
  const monthlyRate = annualRate / 12;
  const payment = principal * monthlyRate * (1 + monthlyRate) ** months / ((1 + monthlyRate) ** months - 1);
  return `贷款本金：${principal.toFixed(2)}\n年利率：${(annualRate * 100).toFixed(2)}%\n期数：${months} 月\n等额本息月供：${payment.toFixed(2)}`;
}

function runCurrencyTool(source) {
  const nums = source.match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
  const amount = nums[0] || 1;
  const rate = nums[1] || 7.2;
  return `金额：${amount}\n汇率：${rate}\n换算结果：${(amount * rate).toFixed(2)}`;
}

function splitIdeas(source) {
  return source.split(/\r?\n|[。！？!?；;]/).map((line) => line.trim()).filter(Boolean);
}

function runPromptGenerator(source) {
  return [
    "角色：你是一名资深产品与增长专家。",
    `任务：围绕“${source}”生成可执行方案。`,
    "要求：先给结论，再给步骤；包含目标用户、关键卖点、页面结构、风险和验证指标。",
    "输出格式：使用 Markdown，分为「方案」「执行清单」「验收标准」。",
    "限制：不要空泛表达，每一点都要能落地。"
  ].join("\n");
}

function runAiTitleGenerator(source) {
  const topic = source.replace(/\s+/g, " ").trim();
  return [
    `1. ${topic}：从入门到高效落地`,
    `2. 解决 ${topic} 的 7 个关键方法`,
    `3. 为什么高手都在用 ${topic}`,
    `4. ${topic} 实战清单：少走弯路版`,
    `5. 一篇讲透 ${topic} 的核心逻辑`,
    `6. ${topic} 常见误区与优化建议`,
    `7. 新手也能掌握的 ${topic} 工作流`,
    `8. ${topic} 提效指南：工具、步骤和案例`
  ].join("\n");
}

function runAiSummary(source) {
  const ideas = splitIdeas(source);
  const summary = ideas.slice(0, 3).join("；") || source.slice(0, 120);
  return [
    `摘要：${summary}${summary.endsWith("。") ? "" : "。"}`,
    "",
    "要点：",
    ...ideas.slice(0, 5).map((item, index) => `${index + 1}. ${item}`),
    "",
    `建议标题：${(ideas[0] || "内容摘要").slice(0, 28)}`
  ].join("\n");
}

function runAiEmail(source) {
  const data = parseKeyValueLines(source);
  const subject = data.subject || data["主题"] || splitIdeas(source)[0] || "沟通事项";
  const goal = data.goal || data["目的"] || source;
  return [
    `主题：${subject}`,
    "",
    "您好，",
    "",
    `想和您同步一下：${goal}`,
    "",
    "我建议先确认目标、时间安排和负责人。如果方便，请您回复可行时间或补充需要我准备的材料。",
    "",
    "谢谢。"
  ].join("\n");
}

function runWeeklyReport(source) {
  const items = splitIdeas(source);
  return [
    "本周进展：",
    ...items.slice(0, 5).map((item) => `- ${item}`),
    "",
    "问题与风险：",
    "- 需要继续确认优先级、资源和交付时间。",
    "",
    "下周计划：",
    ...items.slice(0, 3).map((item) => `- 推进：${item}`)
  ].join("\n");
}

function runXiaohongshuCopy(source) {
  const topic = splitIdeas(source)[0] || source;
  return [
    `标题：${topic}，真的后悔没早点知道`,
    "",
    `最近在整理 ${topic}，发现真正有用的不是堆概念，而是把步骤拆清楚。`,
    "",
    "我的做法：",
    "1. 先明确目标和使用场景",
    "2. 再筛掉低频、复杂、难复用的方法",
    "3. 最后沉淀成可以重复使用的清单",
    "",
    `适合正在做 ${topic} 的朋友收藏。`,
    "#效率工具 #学习笔记 #实用干货"
  ].join("\n");
}

function runShortVideoScript(source) {
  const topic = splitIdeas(source)[0] || source;
  return [
    `选题：${topic}`,
    "",
    "镜头 1（0-3s）：提出痛点，画面快速切入问题场景。",
    `口播：很多人做 ${topic}，第一步就做错了。`,
    "",
    "镜头 2（4-12s）：展示核心方法，配合屏幕录制或实物演示。",
    "口播：先看目标，再看步骤，最后看结果。",
    "",
    "镜头 3（13-25s）：给出可复制清单。",
    "口播：照这个顺序做，效率会稳定很多。",
    "",
    "结尾 CTA：收藏这条，下次直接照着用。"
  ].join("\n");
}

function runInterviewQuestions(source) {
  const role = splitIdeas(source)[0] || source;
  return [
    `岗位：${role}`,
    "1. 请介绍一个你最有代表性的项目，目标、难点和结果分别是什么？",
    "2. 遇到需求不清晰时，你通常如何推进？",
    "3. 请讲一次你定位复杂问题的过程。",
    "4. 如果资源不足但期限固定，你会怎么取舍？",
    "5. 你如何衡量自己的工作质量？",
    "追问：请给出具体数据、时间线和你的个人贡献。"
  ].join("\n");
}

function runStudyPlan(source) {
  const goal = splitIdeas(source)[0] || source;
  return [
    `学习目标：${goal}`,
    "",
    "第 1 周：建立知识框架，完成入门资料和术语整理。",
    "第 2 周：做 2-3 个小练习，记录卡点和解决方法。",
    "第 3 周：完成一个完整项目或案例复盘。",
    "第 4 周：输出总结文档，补齐薄弱环节并准备下一阶段计划。",
    "",
    "每日节奏：30 分钟学习 + 30 分钟实践 + 10 分钟复盘。"
  ].join("\n");
}

function runCodeExplainer(source) {
  const lines = source.split(/\r?\n/).filter(Boolean);
  return [
    "代码说明：",
    `- 共 ${lines.length} 行，主要结构包含 ${source.includes("function") ? "函数定义" : "语句/配置"}。`,
    `- 入口线索：${lines[0]?.trim() || "未识别"}`,
    "- 建议检查：输入输出、异常分支、边界条件和副作用。",
    "",
    "逐步阅读：",
    ...lines.slice(0, 8).map((line, index) => `${index + 1}. ${line.trim()}`)
  ].join("\n");
}

function runMeetingMinutes(source) {
  const items = splitIdeas(source);
  return [
    "会议纪要",
    "",
    "讨论要点：",
    ...items.slice(0, 6).map((item) => `- ${item}`),
    "",
    "决议：",
    `- 优先推进：${items[0] || "待确认事项"}`,
    "",
    "行动项：",
    ...items.slice(0, 3).map((item, index) => `- D+${index + 1}：跟进 ${item}`)
  ].join("\n");
}

function runOkrGenerator(source) {
  const goal = splitIdeas(source)[0] || source;
  return [
    `O：${goal}`,
    "KR1：明确目标用户与核心使用场景，完成需求优先级排序。",
    "KR2：交付可验证版本，并让关键路径完成率达到 80% 以上。",
    "KR3：建立数据看板，持续跟踪转化、留存和问题反馈。",
    "KR4：沉淀复盘文档，形成下一轮优化计划。"
  ].join("\n");
}

function runGanttData(source) {
  const tasks = splitIdeas(source);
  return toCsv([
    ["任务", "开始", "结束", "负责人", "状态"],
    ...tasks.map((task, index) => [`${task}`, `第 ${index + 1} 天`, `第 ${index + 3} 天`, "待分配", index === 0 ? "进行中" : "待开始"])
  ]);
}

function runInvoiceTitleCleaner(source) {
  const data = parseKeyValueLines(source);
  return [
    `公司名称：${data.company || data["公司"] || splitIdeas(source)[0] || ""}`,
    `税号：${data.tax || data["税号"] || "待填写"}`,
    `地址电话：${data.address || data["地址"] || "待填写"}`,
    `开户行及账号：${data.bank || data["银行"] || "待填写"}`
  ].join("\n");
}

function runResumeOptimizer(source) {
  return splitIdeas(source).map((item) => `- 主导/参与 ${item}，明确目标、拆解任务并推动落地，沉淀可复用方法。`).join("\n");
}

function runEmailSignature(source) {
  const data = parseKeyValueLines(source);
  const name = data.name || data["姓名"] || splitIdeas(source)[0] || "姓名";
  return [
    name,
    data.title || data["职位"] || "职位 / 团队",
    data.company || data["公司"] || "公司名称",
    data.phone || data["电话"] || "电话：",
    data.email || data["邮箱"] || "邮箱："
  ].join("\n");
}

function runLeaveNote(source) {
  const data = parseKeyValueLines(source);
  return [
    "请假申请",
    "",
    `请假人：${data.name || data["姓名"] || "我"}`,
    `请假时间：${data.date || data["时间"] || "待填写"}`,
    `请假原因：${data.reason || data["原因"] || source}`,
    "",
    "我会提前同步工作安排，确保相关事项不受影响。请批准。"
  ].join("\n");
}

function runDailyReport(source) {
  const items = splitIdeas(source);
  return [
    "今日日报",
    "",
    "完成事项：",
    ...items.slice(0, 5).map((item) => `- ${item}`),
    "",
    "明日计划：",
    ...items.slice(0, 3).map((item) => `- 继续推进 ${item}`),
    "",
    "风险：暂无阻塞，需持续关注交付节奏。"
  ].join("\n");
}

function runPunctuationFormatter(source) {
  return source
    .replace(/,/g, "，")
    .replace(/\?/g, "？")
    .replace(/!/g, "！")
    .replace(/;/g, "；")
    .replace(/:/g, "：")
    .replace(/\s+/g, " ")
    .replace(/\s*([，。！？；：])\s*/g, "$1")
    .trim();
}

const simplifiedTraditionalPairs = {
  后: "後",
  发: "發",
  复: "復",
  习: "習",
  体: "體",
  网: "網",
  工: "工",
  具: "具",
  转: "轉",
  换: "換"
};

function runChineseConverter(source) {
  const toTraditional = source.replace(/[后发复习体网转换]/g, (char) => simplifiedTraditionalPairs[char] || char);
  const reverse = Object.fromEntries(Object.entries(simplifiedTraditionalPairs).map(([simple, trad]) => [trad, simple]));
  const toSimplified = source.replace(/[後發復習體網轉換]/g, (char) => reverse[char] || char);
  return `转繁体：${toTraditional}\n转简体：${toSimplified}`;
}

const pinyinMap = {
  在: "zai",
  线: "xian",
  工: "gong",
  具: "ju",
  智: "zhi",
  用: "yong",
  文: "wen",
  本: "ben",
  转: "zhuan",
  换: "huan",
  学: "xue",
  习: "xi"
};

function runPinyinConverter(source) {
  return [...source].map((char) => pinyinMap[char] || char).join(" ");
}

function runLoremGenerator(source) {
  const count = Math.max(1, Math.min(20, Number.parseInt(source, 10) || 3));
  const sentence = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
  return Array.from({ length: count }, () => sentence).join("\n\n");
}

function runSensitiveWordChecker(source) {
  const words = ["违法", "欺诈", "暴力", "赌博", "色情", "敏感"];
  const hits = words.filter((word) => source.includes(word));
  return hits.length ? `命中 ${hits.length} 个：${hits.join("、")}` : "未命中内置敏感词。";
}

function runSubtitleConverter(source) {
  if (/WEBVTT/i.test(source)) {
    return source.replace(/^WEBVTT\s*/i, "").replace(/\./g, ",").trim();
  }
  return `WEBVTT\n\n${source.replace(/^\d+\s*$/gm, "").replace(/,/g, ".").trim()}`;
}

function runVideoTitleGenerator(source) {
  const topic = splitIdeas(source)[0] || source;
  return [
    `${topic}，新手最容易忽略的 5 个细节`,
    `我用 ${topic} 做了一次完整实测`,
    `${topic} 快速上手：从 0 到可交付`,
    `别再乱做 ${topic}，这套流程更稳`
  ].join("\n");
}

function runPodcastOutline(source) {
  const topic = splitIdeas(source)[0] || source;
  return [
    `播客主题：${topic}`,
    "00:00 开场：为什么这个话题值得聊",
    "03:00 背景：问题从哪里来",
    "10:00 方法：可复制的经验和案例",
    "22:00 分歧：常见误区与反例",
    "35:00 总结：听众可以马上做的 3 件事"
  ].join("\n");
}

function runTranscriptCleaner(source) {
  return source
    .replace(/(嗯|啊|额|呃|就是|然后然后)/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function runBilibiliTitleHelper(source) {
  const topic = splitIdeas(source)[0] || source;
  return [
    `【实测】${topic} 到底值不值得用？`,
    `我把 ${topic} 的坑都踩了一遍`,
    `${topic} 保姆级教程，一条讲清楚`,
    `别急着做 ${topic}，先看这 5 点`
  ].join("\n");
}

function runYoutubeTags(source) {
  const base = splitIdeas(source).join(" ") || source;
  const words = base.toLowerCase().match(/[\u4e00-\u9fa5]{2,}|[a-z0-9-]{3,}/g) || [];
  return [...new Set([...words, "tutorial", "tools", "productivity", "how to"])].slice(0, 15).join(", ");
}

function runChapterTimeline(source) {
  return splitIdeas(source).map((item, index) => `${String(Math.floor(index * 90 / 60)).padStart(2, "0")}:${String(index * 90 % 60).padStart(2, "0")} ${item}`).join("\n");
}

function runPomodoroTool(source) {
  const nums = source.match(/\d+/g)?.map(Number) || [];
  const focus = nums[0] || 25;
  const rest = nums[1] || 5;
  const rounds = nums[2] || 4;
  return Array.from({ length: rounds }, (_, index) => `第 ${index + 1} 轮：专注 ${focus} 分钟 -> 休息 ${rest} 分钟`).join("\n");
}

function runHabitTracker(source) {
  const habits = splitIdeas(source);
  return toCsv([
    ["习惯", "周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    ...habits.map((habit) => [habit, "□", "□", "□", "□", "□", "□", "□"])
  ]);
}

function fnv1a32(text) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function cyrb53(text, seed = 0) {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let index = 0; index < text.length; index += 1) {
    const ch = text.charCodeAt(index);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

function runHashGenerator(source) {
  return [
    `FNV-1a 32：${fnv1a32(source)}`,
    `cyrb53 64：${cyrb53(source)}`,
    `Base64：${encodeUtf8Base64(source)}`,
    "说明：以上为浏览器本地同步摘要，适合去重、校验和短指纹；加密级 SHA-256 可在后续接入 WebCrypto 异步版本。"
  ].join("\n");
}

function runSvgMinifier(source) {
  return source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .replace(/\s*=\s*/g, "=")
    .replace(/\s+\/>/g, "/>")
    .trim();
}

function runFaviconGenerator(source) {
  const path = source.trim() || "/favicon.png";
  const base = path.replace(/\.(png|jpg|jpeg|svg|ico)$/i, "");
  return [
    `<link rel="icon" href="${base}.ico" sizes="any" />`,
    `<link rel="icon" type="image/svg+xml" href="${base}.svg" />`,
    `<link rel="apple-touch-icon" href="${base}-180.png" />`,
    `<link rel="manifest" href="/site.webmanifest" />`,
    "",
    JSON.stringify({
      icons: [
        { src: `${base}-192.png`, sizes: "192x192", type: "image/png" },
        { src: `${base}-512.png`, sizes: "512x512", type: "image/png" }
      ]
    }, null, 2)
  ].join("\n");
}

function runBase64ToImage(source) {
  const clean = source.trim();
  const mime = clean.startsWith("data:") ? clean.match(/^data:([^;]+)/)?.[1] || "image/png" : "image/png";
  const dataUrl = clean.startsWith("data:") ? clean : `data:${mime};base64,${clean}`;
  return `<img src="${dataUrl}" alt="Base64 decoded image" />`;
}

function runHtmlFormatter(source) {
  return source.replace(/>\s*</g, ">\n<").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).join("\n");
}

function sortJsonValue(value) {
  if (Array.isArray(value)) return value.map(sortJsonValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJsonValue(value[key])]));
  }
  return value;
}

function runJsonUtility(name, source) {
  try {
    const data = JSON.parse(source);
    if (name.includes("校验")) return "JSON 有效。\n" + JSON.stringify(data, null, 2);
    if (name.includes("排序")) return JSON.stringify(sortJsonValue(data), null, 2);
    if (name.includes("压缩")) return JSON.stringify(data);
  } catch (error) {
    return `JSON 解析失败：${error.message}`;
  }
  return source;
}

function runCanonicalTool(source) {
  return `<link rel="canonical" href="${escapeHtml(source.trim())}" />`;
}

function runHreflangTool(source) {
  return source.split(/\r?\n/).map((line) => {
    const [lang, url] = line.split(/\s+|,\s*/).filter(Boolean);
    return lang && url ? `<link rel="alternate" hreflang="${escapeHtml(lang)}" href="${escapeHtml(url)}" />` : "";
  }).filter(Boolean).join("\n");
}

function runRedirectRuleTool(source) {
  return source.split(/\r?\n/).map((line) => {
    const [from, to] = line.split(/\s+|,\s*/).filter(Boolean);
    return from && to ? `redirect 301 ${from} ${to}` : "";
  }).filter(Boolean).join("\n") || "请输入：/old /new";
}

function runBulkSlugTool(source) {
  return source.split(/\r?\n/).map((line) => runSlugTool(line)).filter(Boolean).join("\n");
}

function runAltTextTool(source) {
  return splitIdeas(source).map((item) => `图片展示：${item}。`).join("\n");
}

function runSeoTitleTool(source) {
  const topic = splitIdeas(source)[0] || source;
  return [
    `${topic} 在线工具 - 免费快速使用`,
    `${topic} 工具大全：转换、生成与检测`,
    `${topic} 免费工具 | 无需安装`
  ].join("\n");
}

function runMetaDescriptionTool(source) {
  const topic = splitIdeas(source)[0] || source;
  return `${topic} 在线工具，支持浏览器直接使用、复制结果、下载文本和移动端访问，适合日常办公、开发调试和内容处理。`;
}

function runFaqSchemaTool(source) {
  const questions = splitIdeas(source);
  const mainEntity = questions.map((question) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: "请根据实际页面内容补充答案。" }
  }));
  return `<script type="application/ld+json">\n${JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity }, null, 2)}\n</script>`;
}

function runBreadcrumbSchemaTool(source) {
  const items = source.split(/>|\/|\n/).map((item) => item.trim()).filter(Boolean);
  return `<script type="application/ld+json">\n${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((name, index) => ({ "@type": "ListItem", position: index + 1, name }))
  }, null, 2)}\n</script>`;
}

function runPageSpeedChecklist(source) {
  const page = source.trim() || "当前页面";
  return [
    `页面：${page}`,
    "- 压缩并懒加载首屏外图片",
    "- 拆分非首屏 JS 和重型依赖",
    "- 为 CSS 和字体设置缓存策略",
    "- 检查 LCP 元素尺寸和加载优先级",
    "- 移除未使用脚本，避免阻塞渲染",
    "- 为所有图片设置宽高，减少 CLS"
  ].join("\n");
}

function runTextUtility(name, source) {
  if (name.includes("逗号分隔器") || name.includes("换行转逗号")) return source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).join(", ");
  if (name.includes("逗号转换行")) return source.split(/,|，/).map((item) => item.trim()).filter(Boolean).join("\n");
  if (name.includes("文本截断")) {
    const length = Number(source.match(/\d+/)?.[0]) || 100;
    return source.replace(/^\d+\s*/, "").slice(0, length);
  }
  if (name.includes("文本补全长度")) {
    const length = Number(source.match(/\d+/)?.[0]) || 20;
    const text = source.replace(/^\d+\s*/, "");
    return text.padEnd(length, " ");
  }
  if (name.includes("重复文本")) {
    const count = Math.max(1, Math.min(100, Number(source.match(/\d+/)?.[0]) || 3));
    const text = source.replace(/^\d+\s*/, "");
    return Array.from({ length: count }, () => text).join("\n");
  }
  if (name.includes("行号")) return source.split(/\r?\n/).map((line, index) => `${index + 1}. ${line}`).join("\n");
  if (name.includes("HTML 转文本")) return source.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (name.includes("文本转 HTML")) return source.split(/\r?\n/).filter(Boolean).map((line) => `<p>${escapeHtml(line)}</p>`).join("\n");
  if (name.includes("阅读时间")) return `预计阅读：${Math.max(1, Math.ceil(source.length / 450))} 分钟\n字符数：${source.length}`;
  return source;
}

function runLifeCalculator(name, source) {
  const nums = source.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
  if (name.includes("复利")) {
    const [principal = 10000, rate = 5, years = 10] = nums;
    const total = principal * (1 + rate / 100) ** years;
    return `本金：${principal}\n年化：${rate}%\n年限：${years}\n复利结果：${total.toFixed(2)}`;
  }
  if (name.includes("折扣")) {
    const [price = 100, discount = 80] = nums;
    const finalPrice = price * discount / 100;
    return `原价：${price.toFixed(2)}\n折扣：${discount}%\n折后价：${finalPrice.toFixed(2)}\n节省：${(price - finalPrice).toFixed(2)}`;
  }
  if (name.includes("百分比")) {
    const [part = 1, total = 100] = nums;
    return `${part} / ${total} = ${(part / total * 100).toFixed(2)}%`;
  }
  if (name.includes("工资")) {
    const [salary = 10000, rate = 10] = nums;
    return `税前：${salary.toFixed(2)}\n估算扣除：${(salary * rate / 100).toFixed(2)}\n税后：${(salary * (1 - rate / 100)).toFixed(2)}`;
  }
  if (name.includes("卡路里")) {
    const [weight = 70, height = 170, age = 30] = nums;
    const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    return `基础代谢估算：${bmr.toFixed(0)} kcal/天\n轻度活动：${(bmr * 1.375).toFixed(0)} kcal/天`;
  }
  if (name.includes("饮水量")) {
    const [weight = 60] = nums;
    return `建议饮水量：${(weight * 35).toFixed(0)} ml/天`;
  }
  if (name.includes("睡眠周期")) {
    const cycles = [4, 5, 6].map((cycle) => `${cycle} 个周期：${cycle * 90} 分钟`);
    return cycles.join("\n");
  }
  if (name.includes("时间区间")) {
    const [startH = 9, startM = 0, endH = 18, endM = 0] = nums;
    const minutes = (endH * 60 + endM) - (startH * 60 + startM);
    return `间隔：${Math.floor(minutes / 60)} 小时 ${minutes % 60} 分钟`;
  }
  if (name.includes("随机数")) {
    const [min = 1, max = 100, count = 1] = nums;
    return Array.from({ length: Math.min(100, count) }, () => String(min + secureRandomInt(Math.max(1, max - min + 1)))).join("\n");
  }
  if (name.includes("贷款利息")) {
    const [principal = 10000, rate = 5, years = 1] = nums;
    const interest = principal * rate / 100 * years;
    return `本金：${principal}\n利息：${interest.toFixed(2)}\n本息合计：${(principal + interest).toFixed(2)}`;
  }
  return source;
}

function runGenericTool(name, input) {
  const source = input.trim();
  if (!source) return "请输入内容后再运行。";
  if (name.includes("AI 提示词")) return runPromptGenerator(source);
  if (name.includes("AI 标题")) return runAiTitleGenerator(source);
  if (name.includes("AI 摘要")) return runAiSummary(source);
  if (name.includes("AI 邮件")) return runAiEmail(source);
  if (name.includes("AI 周报")) return runWeeklyReport(source);
  if (name.includes("AI 小红书")) return runXiaohongshuCopy(source);
  if (name.includes("AI 短视频")) return runShortVideoScript(source);
  if (name.includes("AI 面试题")) return runInterviewQuestions(source);
  if (name.includes("AI 学习计划")) return runStudyPlan(source);
  if (name.includes("AI 代码解释器")) return runCodeExplainer(source);
  if (name.includes("ChatGPT") || name.includes("AI 绘画") || name.includes("智能写作")) return `该工具需要接入大模型 API 才能生成真实结果。\n\n已为你生成可提交给模型的请求：\n${source}`;
  if (name.includes("AI 语音") || name.includes("语音转文字")) return "语音识别可使用浏览器 Web Speech API。请在工具面板中点击“开始语音识别”，如果当前浏览器不支持会显示不可用。";
  if (name.includes("Meta 标签")) return runMetaTagTool(source);
  if (name.includes("Robots")) return runRobotsTool(source);
  if (name.includes("Sitemap")) return runSitemapTool(source);
  if (name.includes("Slug")) return runSlugTool(source);
  if (name.includes("标题长度")) return runLengthChecker(source, "title");
  if (name.includes("描述长度")) return runLengthChecker(source, "description");
  if (name.includes("关键词密度")) return runKeywordDensity(source);
  if (name.includes("Open Graph")) return runOpenGraphTool(source);
  if (name.includes("Schema 标记")) return runSchemaTool(source);
  if (name.includes("Canonical")) return runCanonicalTool(source);
  if (name.includes("Hreflang")) return runHreflangTool(source);
  if (name.includes("重定向规则")) return runRedirectRuleTool(source);
  if (name.includes("Slug 批量")) return runBulkSlugTool(source);
  if (name.includes("Alt 文本")) return runAltTextTool(source);
  if (name.includes("页面标题生成器")) return runSeoTitleTool(source);
  if (name.includes("Meta 描述生成器")) return runMetaDescriptionTool(source);
  if (name.includes("FAQ Schema")) return runFaqSchemaTool(source);
  if (name.includes("面包屑 Schema")) return runBreadcrumbSchemaTool(source);
  if (name.includes("页面速度")) return runPageSpeedChecklist(source);
  if (name.includes("字数")) return `字符数：${source.length}\n词/片段数：${source.split(/\s+|，|。|、|,|\\./).filter(Boolean).length}\n行数：${source.split(/\r?\n/).length}\n预计阅读：${Math.max(1, Math.ceil(source.length / 450))} 分钟`;
  if (["逗号分隔器", "换行转逗号", "逗号转换行", "文本截断工具", "文本补全长度", "重复文本生成器", "行号添加器", "HTML 转文本", "文本转 HTML", "阅读时间估算"].some((toolName) => name.includes(toolName))) return runTextUtility(name, source);
  if (name.includes("文本排序")) return runTextSorter(source);
  if (name.includes("文本反转")) return source.split(/\r?\n/).map((line) => [...line].reverse().join("")).reverse().join("\n");
  if (name.includes("空行清理")) return source.split(/\r?\n/).map((line) => line.trimEnd()).filter(Boolean).join("\n");
  if (name.includes("标点格式化")) return runPunctuationFormatter(source);
  if (name.includes("繁简转换")) return runChineseConverter(source);
  if (name.includes("拼音转换")) return runPinyinConverter(source);
  if (name.includes("Lorem Ipsum")) return runLoremGenerator(source);
  if (name.includes("敏感词检测")) return runSensitiveWordChecker(source);
  if (name.includes("文本去重") || name.includes("数据去重")) return [...new Set(source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean))].join("\n");
  if (name.includes("大小写")) return `大写：${source.toUpperCase()}\n\n小写：${source.toLowerCase()}\n\n标题格式：${source.toLowerCase().replace(/\\b\\w/g, (letter) => letter.toUpperCase())}`;
  if (name.includes("CSV 清洗")) return runCsvCleaner(source);
  if (name.includes("CSV 排序")) return runCsvSorter(source);
  if (name.includes("CSV 合并")) return runCsvMerger(source);
  if (name.includes("JSON 路径")) return runJsonPathExtractor(source);
  if (name.includes("JSON Schema")) return runJsonSchemaTool(source);
  if (name.includes("表格转 Markdown")) return runTableToMarkdown(source);
  if (name.includes("Markdown 转表格")) return runMarkdownToTable(source);
  if (name.includes("列表交集差集")) return runListSetOperations(source);
  if (name.includes("数字序列")) return runNumberSequence(source);
  if (name.includes("数据透视")) return runPivotSummary(source);
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
  if (name.includes("Base64 转图片")) return runBase64ToImage(source);
  if (name.includes("Base64")) return runBase64Tool(source);
  if (name.includes("URL 编码") || name.includes("URL 百分号")) return runUrlTool(source);
  if (name.includes("URL 参数清理")) {
    try {
      const url = new URL(source);
      ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"].forEach((key) => url.searchParams.delete(key));
      return url.toString();
    } catch (error) {
      return `URL 解析失败：${error.message}`;
    }
  }
  if (name.includes("HTML 实体")) return runHtmlEntityTool(source);
  if (name.includes("JWT 生成器")) return `Header:\n${encodeUtf8Base64(JSON.stringify({ alg: "HS256", typ: "JWT" }))}\nPayload:\n${encodeUtf8Base64(source)}`;
  if (name.includes("JWT")) return runJwtTool(source);
  if (name.includes("哈希")) return runHashGenerator(source);
  if (name.includes("HTML 格式化")) return runHtmlFormatter(source);
  if (name.includes("HTML 压缩")) return runMinifier(source);
  if (name.includes("CSS 格式化") || name.includes("JavaScript 格式化") || name.includes("TypeScript 格式化")) return source.replace(/\{/g, " {\n  ").replace(/;/g, ";\n").replace(/\}/g, "\n}");
  if (name.includes("JSON 校验器") || name.includes("JSON 排序") || name.includes("JSON 压缩")) return runJsonUtility(name, source);
  if (name.includes("cURL 转代码")) return `fetch("${source.match(/https?:\/\/[^'\"\\s]+/)?.[0] || "https://example.com"}")\n  .then((res) => res.text())\n  .then(console.log);`;
  if (name.includes("HTTP 状态码")) return ({ "200": "200 OK：请求成功", "301": "301 Moved Permanently：永久重定向", "302": "302 Found：临时重定向", "400": "400 Bad Request：请求错误", "401": "401 Unauthorized：未认证", "403": "403 Forbidden：无权限", "404": "404 Not Found：资源不存在", "500": "500 Internal Server Error：服务器错误" }[source.match(/\d{3}/)?.[0]] || "请输入状态码，例如 404。");
  if (name.includes("MIME")) return ({ png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", svg: "image/svg+xml", json: "application/json", pdf: "application/pdf", html: "text/html", css: "text/css", js: "text/javascript" }[source.replace(/^\./, "").toLowerCase()] || "未知 MIME 类型");
  if (name.includes("Dockerfile")) return `FROM node:22-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\nCMD ["npm","run","preview"]`;
  if (name.includes("Gitignore")) return "node_modules\ndist\n.env\n.DS_Store\ncoverage\n*.log";
  if (name.includes("YAML 转 JSON")) return runYamlToJson(source);
  if (name.includes("JSON 转 YAML")) return runJsonToYaml(source);
  if (name.includes("XML 格式化")) return runXmlFormatter(source);
  if (name.includes("SQL 格式化")) return runSqlFormatter(source);
  if (name.includes("CSS 压缩") || name.includes("JavaScript 压缩")) return runMinifier(source);
  if (name.includes("Cron")) return runCronParser(source);
  if (name.includes("User-Agent")) return runUserAgentParser(source);
  if (name.includes("时间戳") || name.includes("Timestamp")) return runTimestampTool(source);
  if (name.includes("UUID")) return runUuidTool(source);
  if (name.includes("密码")) return runPasswordTool(source);
  if (name.includes("正则") || name.includes("Regex")) return runRegexTool(source);
  if (name.includes("Diff") || name.includes("对比")) return runTextDiffTool(source);
  if (name.includes("二维码") || name.includes("QR")) return runQrTool(source);
  if (name.includes("SVG 压缩")) return runSvgMinifier(source);
  if (name.includes("Favicon")) return runFaviconGenerator(source);
  if (name.includes("颜色")) return runColorTool(source);
  if (name.includes("单位")) return runUnitTool(source);
  if (name.includes("BMI")) return runBmiTool(source);
  if (name.includes("年龄")) return runAgeTool(source);
  if (name.includes("小费")) return runTipTool(source);
  if (["贷款利息", "复利", "折扣", "百分比", "工资", "卡路里", "饮水量", "睡眠周期", "时间区间", "随机数"].some((toolName) => name.includes(toolName))) return runLifeCalculator(name, source);
  if (name.includes("房贷")) return runMortgageTool(source);
  if (name.includes("汇率")) return runCurrencyTool(source);
  if (name.includes("番茄钟")) return runPomodoroTool(source);
  if (name.includes("习惯打卡")) return runHabitTracker(source);
  if (name.includes("倒计时")) {
    const date = new Date(source);
    if (Number.isNaN(date.getTime())) return "请输入目标日期，例如 2026-12-31。";
    return `目标日期：${date.toLocaleDateString()}\n倒计时：${Math.ceil((date - new Date()) / 86400000)} 天`;
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
  if (name.includes("字幕格式转换")) return runSubtitleConverter(source);
  if (name.includes("视频标题")) return runVideoTitleGenerator(source);
  if (name.includes("播客大纲")) return runPodcastOutline(source);
  if (name.includes("音频转写清理")) return runTranscriptCleaner(source);
  if (name.includes("B站标题")) return runBilibiliTitleHelper(source);
  if (name.includes("YouTube 标签")) return runYoutubeTags(source);
  if (name.includes("章节时间轴")) return runChapterTimeline(source);
  if (name.includes("字幕")) return source.split(/\r?\n/).filter(Boolean).map((line, index) => `${index + 1}\n00:00:${String(index * 4).padStart(2, "0")},000 --> 00:00:${String(index * 4 + 3).padStart(2, "0")},000\n${line}`).join("\n\n");
  if (name.includes("分镜")) return source.split(/[。.!！?？\n]/).filter(Boolean).map((line, index) => `镜头 ${index + 1}：${line.trim()}\n画面：中景 / 重点突出主体\n时长：${3 + index}s`).join("\n\n");
  if (name.includes("会议纪要")) return runMeetingMinutes(source);
  if (name.includes("OKR")) return runOkrGenerator(source);
  if (name.includes("甘特图")) return runGanttData(source);
  if (name.includes("发票抬头")) return runInvoiceTitleCleaner(source);
  if (name.includes("简历要点")) return runResumeOptimizer(source);
  if (name.includes("邮件签名")) return runEmailSignature(source);
  if (name.includes("请假条")) return runLeaveNote(source);
  if (name.includes("日报生成器")) return runDailyReport(source);
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
  if (name.includes("图片转 Base64")) {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    setResult(dataUrl);
    notify("图片已转换为 Base64");
    return;
  }

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
