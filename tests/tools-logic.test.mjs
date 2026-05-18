import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runGenericTool } from "../src/tools/generic/logic.js";

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
