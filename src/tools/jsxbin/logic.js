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


export {
  sampleJsx,
  stableHash,
  encodeLocalJsxbinEnvelope,
  decodeLocalJsxbinEnvelope,
  analyzeJsxbin,
  validateJsxSource
};
