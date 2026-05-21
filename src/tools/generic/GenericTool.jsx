import React, { useRef, useState } from "react";
import { Download, UploadCloud, Wand2 } from "../../shared/icons.js";
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

  if (tool.name.includes("去背景") || tool.name.includes("抠图")) {
    return <BackgroundCutoutTool tool={tool} notify={notify} toggleSave={toggleSave} saved={saved} />;
  }

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

function BackgroundCutoutTool({ tool, notify, toggleSave, saved }) {
  const canvasRef = useRef(null);
  const sourceImageRef = useRef(null);
  const maskRef = useRef(null);
  const drawingRef = useRef(false);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("上传 JPG、PNG、WebP 图片后，可先自动去背景，再用画笔精修主体边缘。");
  const [brushMode, setBrushMode] = useState("keep");
  const [brushSize, setBrushSize] = useState(34);
  const [threshold, setThreshold] = useState(48);
  const [hasImage, setHasImage] = useState(false);

  const renderCanvas = React.useCallback(() => {
    const canvas = canvasRef.current;
    const source = sourceImageRef.current;
    const mask = maskRef.current;
    if (!canvas || !source || !mask) return;
    const ctx = canvas.getContext("2d");
    const checker = 16;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y += checker) {
      for (let x = 0; x < canvas.width; x += checker) {
        ctx.fillStyle = (Math.floor(x / checker) + Math.floor(y / checker)) % 2 === 0 ? "#eef3fb" : "#dfe7f3";
        ctx.fillRect(x, y, checker, checker);
      }
    }

    const output = new ImageData(new Uint8ClampedArray(source.data), source.width, source.height);
    for (let index = 0; index < mask.length; index += 1) output.data[index * 4 + 3] = mask[index];
    const buffer = document.createElement("canvas");
    buffer.width = source.width;
    buffer.height = source.height;
    buffer.getContext("2d").putImageData(output, 0, 0);
    ctx.drawImage(buffer, 0, 0);
  }, []);

  const loadImage = async (file) => {
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    const img = await new Promise((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = imageUrl;
    });
    URL.revokeObjectURL(imageUrl);

    const maxSide = 1400;
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
    const width = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
    const height = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    sourceImageRef.current = ctx.getImageData(0, 0, width, height);
    maskRef.current = new Uint8ClampedArray(width * height).fill(255);
    setFileName(file.name);
    setHasImage(true);
    setStatus("图片已载入。点击“自动去背景”开始，也可以直接用画笔擦除背景或保留主体。");
    renderCanvas();
  };

  const getCanvasPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.round((event.clientX - rect.left) * (canvas.width / rect.width)),
      y: Math.round((event.clientY - rect.top) * (canvas.height / rect.height))
    };
  };

  const paintAt = React.useCallback((x, y) => {
    const source = sourceImageRef.current;
    const mask = maskRef.current;
    if (!source || !mask) return;
    const radius = brushSize / 2;
    const radiusSquared = radius * radius;
    const value = brushMode === "keep" ? 255 : 0;
    const minY = Math.max(0, Math.floor(y - radius));
    const maxY = Math.min(source.height - 1, Math.ceil(y + radius));
    const minX = Math.max(0, Math.floor(x - radius));
    const maxX = Math.min(source.width - 1, Math.ceil(x + radius));
    for (let yy = minY; yy <= maxY; yy += 1) {
      for (let xx = minX; xx <= maxX; xx += 1) {
        const distance = (xx - x) ** 2 + (yy - y) ** 2;
        if (distance <= radiusSquared) {
          const feather = Math.max(0.35, 1 - Math.sqrt(distance) / radius);
          const index = yy * source.width + xx;
          mask[index] = value === 255 ? Math.max(mask[index], Math.round(255 * feather)) : Math.min(mask[index], Math.round(255 * (1 - feather)));
        }
      }
    }
    renderCanvas();
  }, [brushMode, brushSize, renderCanvas]);

  const applyAutoRemoval = () => {
    const source = sourceImageRef.current;
    if (!source) {
      setStatus("请先上传图片。");
      return;
    }
    maskRef.current = createBackgroundMask(source, threshold);
    renderCanvas();
    setStatus("已自动识别边缘背景。可继续用画笔保留主体或擦除残留背景。");
    notify("自动去背景已完成");
  };

  const resetMask = () => {
    const source = sourceImageRef.current;
    if (!source) return;
    maskRef.current = new Uint8ClampedArray(source.width * source.height).fill(255);
    renderCanvas();
    setStatus("已重置为原图，可重新自动去背景或手动抠图。");
  };

  const downloadPng = async () => {
    const source = sourceImageRef.current;
    const mask = maskRef.current;
    if (!source || !mask) {
      setStatus("请先上传图片并完成抠图。");
      return;
    }
    const output = new ImageData(new Uint8ClampedArray(source.data), source.width, source.height);
    for (let index = 0; index < mask.length; index += 1) output.data[index * 4 + 3] = mask[index];
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = source.width;
    outputCanvas.height = source.height;
    outputCanvas.getContext("2d").putImageData(output, 0, 0);
    const blob = await new Promise((resolve) => outputCanvas.toBlob(resolve, "image/png"));
    downloadBlob(blob, `${fileName.replace(/\.[^.]+$/, "") || "cutout"}-transparent.png`);
    notify("透明 PNG 已下载");
  };

  return (
    <div className="genericTool cutoutTool">
      <p>{tool.desc}</p>
      <label className="fileDrop">
        <input type="file" accept="image/*" onChange={(event) => loadImage(event.target.files?.[0])} />
        <UploadCloud size={28} />
        <span>{fileName || "选择需要去背景的图片"}</span>
      </label>

      <div className="cutoutWorkspace">
        <div className="cutoutCanvasWrap">
          {!hasImage && <div className="cutoutEmpty">上传图片后在这里预览透明背景和画笔选区</div>}
          <canvas
            ref={canvasRef}
            className="cutoutCanvas"
            onPointerDown={(event) => {
              if (!hasImage) return;
              drawingRef.current = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              const point = getCanvasPoint(event);
              paintAt(point.x, point.y);
            }}
            onPointerMove={(event) => {
              if (!drawingRef.current || !hasImage) return;
              const point = getCanvasPoint(event);
              paintAt(point.x, point.y);
            }}
            onPointerUp={() => { drawingRef.current = false; }}
            onPointerCancel={() => { drawingRef.current = false; }}
          />
        </div>
        <aside className="cutoutControls">
          <button className="primaryAction" onClick={applyAutoRemoval} disabled={!hasImage}>
            <Wand2 size={17} />
            自动去背景
          </button>
          <div className="segmentedControl" aria-label="画笔模式">
            <button className={brushMode === "keep" ? "active" : ""} onClick={() => setBrushMode("keep")}>保留主体</button>
            <button className={brushMode === "erase" ? "active" : ""} onClick={() => setBrushMode("erase")}>擦除背景</button>
          </div>
          <label className="rangeControl">
            <span>画笔大小 {brushSize}px</span>
            <input type="range" min="8" max="120" value={brushSize} onChange={(event) => setBrushSize(Number(event.target.value))} />
          </label>
          <label className="rangeControl">
            <span>自动识别强度 {threshold}</span>
            <input type="range" min="18" max="90" value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} />
          </label>
          <div className="modalActions cutoutActions">
            <button onClick={resetMask} disabled={!hasImage}>重置</button>
            <button className="primaryAction" onClick={downloadPng} disabled={!hasImage}>
              <Download size={17} />
              下载 PNG
            </button>
          </div>
          <p className="cutoutStatus">{status}</p>
        </aside>
      </div>

      <div className="modalActions">
        <button onClick={() => toggleSave(tool.name)}>{saved ? "取消收藏" : "收藏工具"}</button>
      </div>
    </div>
  );
}

function createBackgroundMask(imageData, threshold = 48) {
  const { width, height, data } = imageData;
  const total = width * height;
  const visited = new Uint8Array(total);
  const mask = new Uint8ClampedArray(total).fill(255);
  const samples = [
    colorAt(data, 0),
    colorAt(data, width - 1),
    colorAt(data, (height - 1) * width),
    colorAt(data, total - 1)
  ];
  const background = samples.reduce((sum, color) => [sum[0] + color[0], sum[1] + color[1], sum[2] + color[2]], [0, 0, 0]).map((value) => value / samples.length);
  const queue = [];
  const enqueue = (index) => {
    if (index < 0 || index >= total || visited[index]) return;
    if (colorDistance(colorAt(data, index), background) > threshold) return;
    visited[index] = 1;
    queue.push(index);
  };
  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const index = queue[cursor];
    const x = index % width;
    const y = Math.floor(index / width);
    mask[index] = 0;
    if (x > 0) enqueue(index - 1);
    if (x < width - 1) enqueue(index + 1);
    if (y > 0) enqueue(index - width);
    if (y < height - 1) enqueue(index + width);
  }

  const softened = new Uint8ClampedArray(mask);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      if (mask[index] === 0) continue;
      const nearBackground = mask[index - 1] === 0 || mask[index + 1] === 0 || mask[index - width] === 0 || mask[index + width] === 0;
      if (nearBackground) softened[index] = 210;
    }
  }
  return softened;
}

function colorAt(data, pixelIndex) {
  const offset = pixelIndex * 4;
  return [data[offset], data[offset + 1], data[offset + 2]];
}

function colorDistance(left, right) {
  return Math.sqrt((left[0] - right[0]) ** 2 + (left[1] - right[1]) ** 2 + (left[2] - right[2]) ** 2);
}


export { GenericTool };
