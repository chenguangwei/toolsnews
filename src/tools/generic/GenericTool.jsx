import React, { useState } from "react";
import { UploadCloud } from "../../shared/icons.js";
import { genericToolSamples } from "../../data/siteData.jsx";
import { downloadBlob } from "../../shared/utils.js";
import { classifyTool, runGenericTool, runImageTool } from "./logic.js";

function GenericTool({ tool, notify, toggleSave, saved }) {
  const toolType = classifyTool(tool.name);
  const [input, setInput] = useState(genericToolSamples[tool.name] || tool.sample || genericToolSamples.default);
  const [result, setResult] = useState("");
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [todoItems, setTodoItems] = useState(() => JSON.parse(localStorage.getItem("todoItems") || "[]"));
  const [imagePreview, setImagePreview] = useState("");
  const isSvgResult = result.trim().startsWith("<svg ");
  const run = async () => {
    if (toolType === "pdf") {
      try {
        setBusy(true);
        setResult("正在处理 PDF...");
        const { runPdfOperation } = await import("../pdf/logic.js");
        const output = await runPdfOperation(tool.name, files, input);
        downloadBlob(output.blob, output.fileName);
        setResult(output.note);
        notify(`${tool.name} 已完成并下载`);
      } catch (error) {
        setResult(error.message);
      } finally {
        setBusy(false);
      }
      return;
    }
    if (toolType === "image") {
      if (!files[0]) {
        setResult("请先选择图片文件。");
        return;
      }
      await runImageTool(tool.name, files[0], input, setImagePreview, setResult, notify);
      return;
    }
    if (tool.name.includes("待办")) {
      const items = input.split(/\n/).map((item) => item.trim()).filter(Boolean).map((text) => ({ id: Date.now() + Math.random(), text, done: false }));
      const next = [...todoItems, ...items];
      setTodoItems(next);
      localStorage.setItem("todoItems", JSON.stringify(next));
      setResult(`已添加 ${items.length} 个待办。`);
      notify("待办已保存");
      return;
    }
    if (tool.name.includes("音频信息")) {
      if (!files[0]) return setResult("请先选择音频文件。");
      const url = URL.createObjectURL(files[0]);
      const audio = document.createElement("audio");
      audio.src = url;
      audio.onloadedmetadata = () => {
        setResult(`文件名：${files[0].name}\n大小：${(files[0].size / 1024 / 1024).toFixed(2)} MB\n时长：${audio.duration.toFixed(2)} 秒\n类型：${files[0].type || "未知"}`);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => setResult("无法读取该媒体文件信息。");
      return;
    }
    if (tool.name.includes("语音转文字") || tool.name.includes("AI 语音")) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setResult("当前浏览器不支持 Web Speech API。");
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = "zh-CN";
      recognition.onresult = (event) => setResult(event.results[0][0].transcript);
      recognition.onerror = (event) => setResult(`语音识别失败：${event.error}`);
      recognition.start();
      notify("已开始语音识别，请对麦克风说话");
      return;
    }
    if (tool.name.includes("API 接口测试")) {
      try {
        const response = await fetch(input.trim());
        const text = await response.text();
        setResult(`HTTP ${response.status} ${response.statusText}\n\n${text.slice(0, 2000)}`);
      } catch (error) {
        setResult(`请求失败：${error.message}\n浏览器请求可能受 CORS 限制，生产环境建议走后端代理。`);
      }
      return;
    }
    if (tool.name.includes("在线编译器")) {
      try {
        const value = Function(`"use strict";\n${input}`)();
        setResult(`运行完成：${value === undefined ? "无返回值" : String(value)}`);
      } catch (error) {
        setResult(`运行失败：${error.message}`);
      }
      return;
    }
    const output = runGenericTool(tool.name, input);
    setResult(output);
    notify(`${tool.name} 已运行`);
  };
  const copyResult = async () => {
    await navigator.clipboard.writeText(result || "");
    notify("结果已复制");
  };
  const downloadResult = () => {
    downloadBlob(new Blob([result || input], { type: "text/plain;charset=utf-8" }), `${tool.name}.txt`);
    notify("结果已下载");
  };
  return (
    <div className="genericTool">
      <p>{tool.desc}</p>
      {(toolType === "pdf" || toolType === "image" || tool.name.includes("音频")) && (
        <label className="fileDrop">
          <input type="file" multiple={tool.name.includes("合并")} accept={toolType === "image" ? "image/*" : toolType === "pdf" ? "application/pdf" : "audio/*,video/*"} onChange={(event) => {
            const list = [...event.target.files];
            setFiles(list);
            setResult(`已选择 ${list.length} 个文件：${list.map((file) => file.name).join("、")}`);
            if (toolType === "image" && list[0]) setImagePreview(URL.createObjectURL(list[0]));
          }} />
          <UploadCloud size={28} />
          <span>{files.length ? files.map((file) => file.name).join("、") : "选择文件"}</span>
        </label>
      )}
      <textarea value={input} onChange={(event) => setInput(event.target.value)} />
      {imagePreview && <img className="toolPreview" src={imagePreview} alt="预览" />}
      <div className="modalActions">
        <button className="primaryAction" onClick={run} disabled={busy}>{busy ? "处理中..." : "运行工具"}</button>
        <button onClick={() => toggleSave(tool.name)}>{saved ? "取消收藏" : "收藏工具"}</button>
        <button onClick={copyResult} disabled={!result}>复制结果</button>
        <button onClick={downloadResult}>下载文本</button>
      </div>
      {tool.name.includes("待办") && (
        <div className="todoList">
          {todoItems.map((item) => (
            <button key={item.id} onClick={() => {
              const next = todoItems.map((todo) => todo.id === item.id ? { ...todo, done: !todo.done } : todo);
              setTodoItems(next);
              localStorage.setItem("todoItems", JSON.stringify(next));
            }}>{item.done ? "✓" : "○"} {item.text}</button>
          ))}
        </div>
      )}
      {isSvgResult && <div className="svgResultPreview" dangerouslySetInnerHTML={{ __html: result }} />}
      {result && <pre>{result}</pre>}
    </div>
  );
}


export { GenericTool };
