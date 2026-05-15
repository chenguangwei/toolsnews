import React, { useState } from "react";
import { Star, UploadCloud } from "../../shared/icons.js";
import { allTools } from "../../data/siteData.jsx";
import { downloadBlob, formatBytes } from "../../shared/utils.js";
import {
  analyzeJsxbin,
  decodeLocalJsxbinEnvelope,
  encodeLocalJsxbinEnvelope,
  sampleJsx,
  stableHash,
  validateJsxSource
} from "./logic.js";

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

export { JsxbinToolPage, JsxbinDecodePage };
