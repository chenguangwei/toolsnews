import React, { useRef, useState } from "react";
import { ArrowRight, BadgeCheck, Bolt, Check, Clock3, FileText, Grid2X2, Layers3, Plus, Search, ShieldCheck, Star, UploadCloud } from "../../shared/icons.js";
import { articles, faqAnswers, pdfSubToolObjects, pdfSubTools } from "../../data/siteData.jsx";
import { useI18n } from "../../i18n/I18nProvider.jsx";
import { downloadBlob, scrollToSelector } from "../../shared/utils.js";
import { buildDocxFromPdf, extractPdfText } from "./logic.js";
import { ActionPanel, CategoryPanel } from "../../pages/HomePage.jsx";
import { PanelTitle } from "../../shared/components/Layout.jsx";

function ToolPage({ setRoute, notify, setModal, toggleSave, savedTools, openTool }) {
  const { categories: cat, messages: t } = useI18n();
  const [ocr, setOcr] = useState(false);
  const [range, setRange] = useState("all");
  const [rangeText, setRangeText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [outputFormat, setOutputFormat] = useState("docx");
  const [keepLayout, setKeepLayout] = useState(true);
  const [extractImages, setExtractImages] = useState(true);
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState("");
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem("conversionHistory") || "[]"));
  const [toolLanguage, setToolLanguage] = useState("中文");
  const [activeSubTool, setActiveSubTool] = useState("PDF转Word");
  const fileInputRef = useRef(null);

  const saveHistory = (item) => {
    const next = [item, ...history].slice(0, 7);
    setHistory(next);
    localStorage.setItem("conversionHistory", JSON.stringify(next));
  };

  const setFile = (file) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      notify("请选择 PDF 文件");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      notify("文件超过 50MB 限制");
      return;
    }
    setSelectedFile(file);
    setStatus("idle");
    setProgress("文件已就绪，可以开始转换。");
  };

  const start = async () => {
    if (!selectedFile) {
      notify("请先选择 PDF 文件");
      fileInputRef.current?.click();
      return;
    }
    if (ocr) {
      setStatus("error");
      setProgress("OCR 识别需要图像识别模型或后端服务，当前纯前端版本无法处理扫描件。请关闭 OCR 后转换文本型 PDF。");
      return;
    }
    try {
      setStatus("working");
      setProgress("正在读取 PDF 文本...");
      const paragraphs = await extractPdfText(selectedFile, range, rangeText);
      const baseName = selectedFile.name.replace(/\.pdf$/i, "");
      if (outputFormat === "txt") {
        const text = paragraphs.map((item) => `第 ${item.page} 页\n${item.text}`).join("\n\n");
        downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), `${baseName}.txt`);
      } else {
        setProgress("正在生成 Word 文档...");
        const blob = await buildDocxFromPdf(selectedFile, paragraphs);
        downloadBlob(blob, `${baseName}.docx`);
      }
      const item = {
        id: Date.now(),
        from: selectedFile.name,
        to: `${baseName}.${outputFormat === "txt" ? "txt" : "docx"}`,
        pages: paragraphs.length,
        time: new Date().toLocaleString()
      };
      saveHistory(item);
      setStatus("done");
      setProgress(`转换完成，已下载 ${item.to}`);
      notify("转换完成，文件已下载");
    } catch (error) {
      setStatus("error");
      setProgress(error.message || "转换失败，请换一个 PDF 文件重试。");
    }
  };

  const selectSubTool = (item) => {
    setActiveSubTool(item);
    if (item === "PDF转Word") return;
    setModal({ type: "generic-tool", title: item, toolOverride: pdfSubToolObjects.find((tool) => tool.name === item) });
  };

  return (
    <main className="toolPage">
      <div className="toolPageShell">
        <aside className="sidebar detailSidebar">
          <CategoryPanel t={t} cat={cat} activeCategory="pdf" setActiveCategory={(id) => { if (id === "pdf") scrollToSelector(".converterCard"); else { setRoute("home"); window.setTimeout(() => document.querySelector(`[data-category-id="${id}"]`)?.click(), 120); } }} />
          <div className="panel subTools">
            <h3>PDF工具</h3>
            {pdfSubTools.map((item, index) => (
              <button key={item} className={activeSubTool === item ? "active" : ""} onClick={() => selectSubTool(item)}>
                <FileText size={16} />
                {item}
              </button>
            ))}
          </div>
          <ActionPanel icon={BadgeCheck} title="收藏常用工具站" body="快速访问常用工具，效率翻倍" cta={savedTools.has("PDF转Word") ? "已收藏" : t.collect} onAction={() => toggleSave("PDF转Word")} />
        </aside>
        <section className="toolMain">
          <div className="breadcrumb detailCrumb">
            <button onClick={() => setRoute("home")}>{t.breadcrumbHome}</button>
            <span>/</span>
            <span>PDF工具</span>
            <span>/</span>
            <strong>PDF转Word</strong>
          </div>
          <div className="converterCard">
            <div className="converterHead">
              <span className="pdfLogo">
                <FileText size={40} />
              </span>
              <div>
                <h1>PDF转Word</h1>
                <p>在线将PDF文件转换为可编辑的Word文档，精准保留原格式与排版</p>
                <div className="ratingLine">
                  <span className="stars">★★★★★</span>
                  <strong>4.8</strong>
                  <span>（2.9K）</span>
                  <em>在线使用，无需安装</em>
                  <em>文件自动删除，保护隐私</em>
                </div>
              </div>
              <button className={savedTools.has("PDF转Word") ? "saveBtn saved" : "saveBtn"} onClick={() => toggleSave("PDF转Word")}>
                <Star size={18} />
                {savedTools.has("PDF转Word") ? "已收藏" : "收藏"}
              </button>
            </div>
            <div className="languageTabs">
              <span>{t.supportLang}</span>
              {["中文", "English", "日本語"].map((item, index) => (
                <button className={toolLanguage === item ? "active" : ""} key={item} onClick={() => { setToolLanguage(item); notify(`工具语言已切换为 ${item}`); }}>{item}</button>
              ))}
            </div>
            <div
              className="uploadBox"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                setFile(event.dataTransfer.files?.[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={64} />
              <h2>{selectedFile?.name || t.upload}</h2>
              <p>{selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB · ${progress || "已选择文件"}` : t.uploadHint}</p>
              <label className="chooseFile">
                <input ref={fileInputRef} type="file" accept="application/pdf" onClick={(event) => event.stopPropagation()} onChange={(event) => setFile(event.target.files?.[0])} />
                {t.choosePdf}
              </label>
              <div className="uploadTrust">
                <span><Layers3 size={16} />批量转换</span>
                <span><Search size={16} />OCR识别</span>
                <span><FileText size={16} />保持排版</span>
                <span><ShieldCheck size={16} />安全私密</span>
              </div>
            </div>
            <div className="settingsBox">
              <h3>{t.settings}</h3>
              <div className="formGrid">
                <label>
                  <span>{t.output}</span>
                  <select value={outputFormat} onChange={(event) => setOutputFormat(event.target.value)}>
                    <option value="docx">Word文档（.docx）</option>
                    <option value="docx">Word 97-2003（自动生成 .docx）</option>
                    <option value="txt">纯文本（.txt）</option>
                  </select>
                </label>
                <label>
                  <span>识别模式（OCR）</span>
                  <button className={ocr ? "switch on" : "switch"} type="button" onClick={() => { setOcr(!ocr); notify(!ocr ? "OCR 需要后端识别服务，开启后会阻止本地转换" : "已关闭 OCR，可进行本地文本转换"); }}>
                    <i />
                  </button>
                  <small>{t.ocr}</small>
                </label>
              </div>
              <div className="radioLine">
                <span>{t.range}</span>
                <button className={range === "all" ? "active" : ""} onClick={() => setRange("all")}><i />{t.allPages}</button>
                <button className={range === "pages" ? "active" : ""} onClick={() => setRange("pages")}><i />{t.selectedPages}</button>
                <input value={rangeText} onChange={(event) => setRangeText(event.target.value)} placeholder="例如：1-10, 20-30" disabled={range !== "pages"} />
              </div>
              <div className="checkLine">
                <span>{t.more}</span>
                <label><input type="checkbox" checked={keepLayout} onChange={(event) => setKeepLayout(event.target.checked)} />{t.keepLayout}</label>
                <label><input type="checkbox" checked={extractImages} onChange={(event) => setExtractImages(event.target.checked)} />{t.extractImages}</label>
              </div>
              {progress && <p className={status === "error" ? "progressNote error" : "progressNote"}>{progress}</p>}
              <button className="startBtn" onClick={start} disabled={status === "working"}>
                <Bolt size={21} fill="currentColor" />
                {status === "working" ? "正在转换..." : status === "done" ? "重新转换并下载" : t.start}
              </button>
              <p className="privacyNote">当前版本在浏览器本地提取文本并生成 Word，不上传文件；OCR 和高保真排版需后端服务。</p>
            </div>
          </div>
          <div className="historyCard panel">
            <PanelTitle title={t.history} action={`${t.clearHistory}  ${t.refresh}`} onAction={() => { setHistory([]); localStorage.removeItem("conversionHistory"); notify("已清空转换记录"); }} />
            {history.length ? (
              <div className="historyList">
                {history.map((item) => (
                  <button key={item.id} onClick={() => notify(`记录：${item.from}，转换 ${item.pages} 页`)}>
                    <span>{item.from} → {item.to}</span>
                    <small>{item.time}</small>
                  </button>
                ))}
              </div>
            ) : <p>{t.noHistory}</p>}
          </div>
          <ToolInfoSections t={t} setModal={setModal} />
        </section>
        <aside className="rightRail">
          <InfoCard t={t} />
          <StepsCard t={t} />
          <RelatedCard t={t} openTool={openTool} setModal={setModal} />
          <SecurityCard t={t} />
        </aside>
      </div>
    </main>
  );
}

function InfoCard({ t }) {
  return (
    <div className="panel sideInfo">
      <h3>{t.toolIntro}</h3>
      <p>PDF转Word工具可将PDF文档转换为可编辑的Word文档（.docx），支持文字、表格、图片等内容精准还原，适用于学习、办公和内容编辑等场景。</p>
      <div className="infoIcons">
        <span><ShieldCheck size={20} />安全私密</span>
        <span><Clock3 size={20} />极速转换</span>
        <span><BadgeCheck size={20} />精准识别</span>
      </div>
      <p className="small">我们承诺：您的文件仅用于转换，转换完成后自动删除，保障您的隐私安全。</p>
    </div>
  );
}

function StepsCard({ t }) {
  const steps = ["上传PDF文件", "设置转换选项", "开始转换", "下载Word文件"];
  return (
    <div className="panel stepsCard">
      <h3>{t.steps}</h3>
      {steps.map((step, index) => (
        <div className="step" key={step}>
          <span>{index + 1}</span>
          <div>
            <strong>{step}</strong>
            <p>{index === 0 ? "点击或拖拽PDF文件到上传区域" : index === 1 ? "选择输出格式、OCR识别以及页面范围" : index === 2 ? "点击开始转换按钮，等待处理完成" : "转换完成后自动下载Word文档"}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function RelatedCard({ t, openTool, setModal }) {
  const related = ["PDF转Excel", "PDF转PPT", "PDF转图片", "Word转PDF", "PDF合并"];
  return (
    <div className="panel relatedCard">
      <h3>{t.related}</h3>
      {related.map((item) => (
        <button key={item} onClick={() => setModal({ type: "generic-tool", title: item, toolOverride: pdfSubToolObjects.find((tool) => tool.name === item) })}>
          <FileText size={17} />
          {item}
        </button>
      ))}
      <button className="textLink" onClick={() => scrollToSelector(".subTools")}>查看更多 PDF工具 →</button>
    </div>
  );
}

function SecurityCard({ t }) {
  return (
    <div className="panel securityCard">
      <h3>{t.secure}</h3>
      <p><Check size={16} />文件传输全程加密（SSL）</p>
      <p><Check size={16} />转换后自动删除，保护隐私</p>
      <p><Check size={16} />完全免费使用，无使用限制</p>
      <span><ShieldCheck size={52} /></span>
    </div>
  );
}

function ToolInfoSections({ t, setModal }) {
  const [activeTab, setActiveTab] = useState(t.toolIntro);
  const [openFaq, setOpenFaq] = useState(null);
  const features = [
    ["高清晰转换", "保留原始排版、字体、表格"],
    ["OCR识别", "支持扫描件和图片型PDF"],
    ["批量处理", "一次转换多个PDF文件"],
    ["云端处理", "在线转换，无需安装软件"]
  ];
  return (
    <>
      <section className="panel introTabs">
        <div className="tabs">
          {[t.toolIntro, "功能亮点", "支持格式", "用户评价（2.9k）"].map((item, index) => (
            <button className={activeTab === item ? "active" : ""} key={item} onClick={() => setActiveTab(item)}>{item}</button>
          ))}
        </div>
        <p>{activeTab === t.toolIntro ? "PDF转Word工具可以将PDF文件转换为可编辑的Word文档。当前纯前端版本支持文本型 PDF 的本地文本提取和 .docx 生成。" : activeTab === "功能亮点" ? "支持本地读取 PDF、指定页码范围、生成 Word 或 TXT、保存最近 7 条转换历史。" : activeTab === "支持格式" ? "输入支持 PDF；输出支持 DOCX 与 TXT。扫描件和图片型 PDF 需要 OCR 服务。" : "用户评分 4.8，核心反馈集中在打开即用、无需安装、文件不上传。"} </p>
        <div className="featureLine">
          {features.map(([title, body]) => (
            <div key={title}>
              <span><Grid2X2 size={22} /></span>
              <strong>{title}</strong>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="panel tutorial">
        <h2>使用步骤（图文教程）</h2>
        <div className="tutorialSteps">
          {["上传PDF文件", "设置转换选项", "开始转换", "下载Word文件"].map((item, index) => (
            <div key={item}>
              <span>{index + 1}</span>
              <strong>{item}</strong>
              {index < 3 && <ArrowRight size={18} />}
            </div>
          ))}
        </div>
      </section>
      <section className="toolBottomGrid">
        <div className="panel faqPanel">
          <PanelTitle title={t.faq} action="全部展开" onAction={() => setOpenFaq(openFaq === "all" ? null : "all")} />
          {["PDF转Word后排版会变吗？", "转换后的Word可以编辑吗？", "OCR识别有什么作用？", "支持扫描件PDF转换吗？", "文件会保存到服务器吗？"].map((item) => (
            <div className="faqItem" key={item}>
              <button className="faqRow" onClick={() => setOpenFaq(openFaq === item ? null : item)}>{item}<Plus size={17} /></button>
              {(openFaq === item || openFaq === "all") && <p>{faqAnswers[item]}</p>}
            </div>
          ))}
        </div>
        <div className="panel articlePanel">
          <PanelTitle title="相关文章 / 教程" action="查看更多文章 →" onAction={() => setModal({ type: "message", title: "相关文章", message: "已按 PDF 转换主题筛选教程，可点击任意标题查看详情。" })} />
          {articles.map((article) => (
            <button className="textArticle" key={article.title} onClick={() => setModal({ type: "article", title: article.title, article })}>
              <h3>{article.title}</h3>
              <p>阅读量 12.6k　2024-05-08</p>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}


export { ToolPage as PdfWordToolPage };
