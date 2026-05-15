import React, { useState } from "react";
import { Bolt, Copy, Download, ExternalLink, Image, Link2, Plus, RefreshCw, ShieldCheck, Star } from "../../shared/icons.js";
import { allTools } from "../../data/siteData.jsx";
import { downloadBlob } from "../../shared/utils.js";
import { PanelTitle } from "../../shared/components/Layout.jsx";
import { parseVscoMedia, VSCO_DEMO_STATE, VSCO_SAMPLE_URL, vscoFileName } from "./logic.js";

function VscoDownloaderPage({ setRoute, notify, toggleSave, savedTools, openTool }) {
  const [source, setSource] = useState(VSCO_SAMPLE_URL);
  const [htmlInput, setHtmlInput] = useState("");
  const [includeThumbnails, setIncludeThumbnails] = useState(true);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("Enter a VSCO post URL, or paste the page HTML / __PRELOADED_STATE__ JSON below.");
  const [activeFaq, setActiveFaq] = useState(null);
  const isSaved = savedTools.has("VSCO Downloader");

  const copyText = async (text, label = "Content") => {
    await navigator.clipboard.writeText(text);
    notify(`${label} copied`);
  };

  const extract = async () => {
    const pasted = htmlInput.trim();
    const url = source.trim();
    try {
      setStatus("working");
      setMessage("Reading VSCO media state...");
      let payload = pasted;
      if (!payload && /^https:\/\/vsco\.co\/[^/]+\/media\/[a-z0-9]+/i.test(url)) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`VSCO responded with HTTP ${response.status}.`);
        payload = await response.text();
      }
      if (!payload) {
        throw new Error("Browser direct fetch may be blocked by CORS. Paste the VSCO page HTML or __PRELOADED_STATE__ JSON to extract locally.");
      }
      const next = parseVscoMedia(payload, includeThumbnails);
      setResults(next);
      setStatus("done");
      setMessage(`Found ${next.length} raw VSCO media URL${next.length > 1 ? "s" : ""}.`);
      notify("VSCO media links extracted");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Extraction failed.");
      setResults([]);
    }
  };

  const loadDemo = () => {
    setSource(VSCO_SAMPLE_URL);
    setHtmlInput(VSCO_DEMO_STATE);
    const next = parseVscoMedia(VSCO_DEMO_STATE, includeThumbnails);
    setResults(next);
    setStatus("done");
    setMessage("Loaded demo data from the open-source README examples.");
    notify("Demo VSCO data loaded");
  };

  const exportResults = (format) => {
    if (!results.length) {
      notify("No extracted links to export");
      return;
    }
    const payload = format === "json"
      ? JSON.stringify(results, null, 2)
      : results.map((item) => item.url).join("\n");
    downloadBlob(new Blob([payload], { type: format === "json" ? "application/json" : "text/plain;charset=utf-8" }), `vsco-downloader-results.${format}`);
  };

  const steps = [
    ["Paste", "Add a VSCO post URL, or paste the page HTML / preloaded JSON."],
    ["Extract", "The browser parser reads medias.byId and normalizes image, thumbnail, and video URLs."],
    ["Use", "Copy every raw path, open media in a new tab, or export TXT / JSON."]
  ];
  const faqs = [
    ["What does VSCO Downloader extract?", "It extracts raw image paths, video thumbnail paths, and MP4 video paths found in VSCO post preloaded state."],
    ["Why does URL fetch sometimes fail?", "Static browser apps cannot set VSCO request headers or bypass CORS. Pasting HTML/JSON keeps the tool independent and local; production deployments can add a backend proxy."],
    ["Is this based on the open-source project?", "Yes. The parser mirrors michabirklbauer/vsco_downloader: read window.__PRELOADED_STATE__, parse medias.byId, then collect responsiveUrl and videoUrl."],
    ["Can it download private VSCO posts?", "No. Use it only for posts you can legally access and process. It does not bypass authentication or permissions."]
  ];

  return (
    <main className="vscoPage">
      <div className="vscoShell">
        <div className="breadcrumb detailCrumb">
          <button onClick={() => setRoute("home")}>Home</button>
          <span>/</span>
          <span>Image Tools</span>
          <span>/</span>
          <strong>VSCO Downloader</strong>
        </div>
        <section className="vscoHero">
          <div className="vscoHeroCopy">
            <span className="vscoMark"><Download size={34} /></span>
            <h1>VSCO Downloader</h1>
            <p>A simple python library to extract raw image and video paths from VSCO posts.</p>
            <div className="vscoHeroActions">
              <button className="primaryAction" onClick={() => document.querySelector(".vscoWorkspace")?.scrollIntoView({ behavior: "smooth" })}>
                <Bolt size={18} fill="currentColor" />
                Start extracting
              </button>
              <button onClick={() => toggleSave("VSCO Downloader")}>
                <Star size={17} fill={isSaved ? "currentColor" : "none"} />
                {isSaved ? "Saved" : "Save tool"}
              </button>
            </div>
          </div>
          <div className="vscoStatusPanel">
            <strong>Extraction model</strong>
            <p>Reads VSCO preloaded state, normalizes protocol-less URLs, deduplicates paths, and keeps processing in this browser.</p>
            <div>
              <span><Image size={17} /> JPG / WebP</span>
              <span><Download size={17} /> MP4</span>
              <span><ShieldCheck size={17} /> Local parse</span>
            </div>
          </div>
        </section>

        <section className="vscoLayout">
          <div className="vscoWorkspace">
            <div className="vscoInputPanel">
              <div className="panelTitleRow">
                <div>
                  <h2>Extract raw VSCO media URLs</h2>
                  <p>Use a URL when your deployment has access, or paste page HTML / JSON for a fully static workflow.</p>
                </div>
                <button className="iconTextButton" onClick={loadDemo}><RefreshCw size={17} />Demo</button>
              </div>
              <label className="vscoField">
                <span>VSCO post URL</span>
                <div className="vscoUrlInput">
                  <Link2 size={19} />
                  <input value={source} onChange={(event) => setSource(event.target.value)} placeholder="https://vsco.co/user/media/post-id" />
                </div>
              </label>
              <label className="vscoField">
                <span>Page HTML or window.__PRELOADED_STATE__ JSON</span>
                <textarea value={htmlInput} onChange={(event) => setHtmlInput(event.target.value)} placeholder="Paste the VSCO page source or the JSON assigned to window.__PRELOADED_STATE__ here..." />
              </label>
              <div className="vscoControls">
                <label className="vscoToggle">
                  <input type="checkbox" checked={includeThumbnails} onChange={(event) => setIncludeThumbnails(event.target.checked)} />
                  Include video thumbnails
                </label>
                <button className="startBtn" onClick={extract} disabled={status === "working"}>
                  <Bolt size={20} fill="currentColor" />
                  {status === "working" ? "Extracting..." : "Extract links"}
                </button>
              </div>
              <p className={status === "error" ? "vscoMessage error" : "vscoMessage"}>{message}</p>
            </div>

            <div className="vscoResultsPanel">
              <div className="panelTitleRow">
                <div>
                  <h2>Results</h2>
                  <p>{results.length ? `${results.length} raw path${results.length > 1 ? "s" : ""} ready` : "Extracted image and video URLs appear here."}</p>
                </div>
                <div className="vscoExportActions">
                  <button onClick={() => copyText(results.map((item) => item.url).join("\n"), "All links")} disabled={!results.length}><Copy size={16} />Copy all</button>
                  <button onClick={() => exportResults("txt")} disabled={!results.length}><Download size={16} />TXT</button>
                  <button onClick={() => exportResults("json")} disabled={!results.length}><Download size={16} />JSON</button>
                </div>
              </div>
              <div className="vscoResultList">
                {results.length ? results.map((item, index) => (
                  <article className="vscoResult" key={item.url}>
                    <span className={`vscoType ${item.type}`}>{item.type}</span>
                    <div>
                      <strong>{vscoFileName(item.url, index)}</strong>
                      <code>{item.url}</code>
                    </div>
                    <button aria-label="Copy URL" onClick={() => copyText(item.url, "URL")}><Copy size={17} /></button>
                    <a aria-label="Open media" href={item.url} target="_blank" rel="noreferrer"><ExternalLink size={17} /></a>
                    <a aria-label="Download media" href={item.url} download={vscoFileName(item.url, index)}><Download size={17} /></a>
                  </article>
                )) : (
                  <div className="vscoEmpty">
                    <Download size={38} />
                    <strong>No media extracted yet</strong>
                    <p>Paste VSCO source data or load the demo to inspect parser output.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="vscoAside">
            <div className="panel sideInfo">
              <h3>Based on MIT open source</h3>
              <p>Implementation references <a href="https://github.com/michabirklbauer/vsco_downloader" target="_blank" rel="noreferrer">michabirklbauer/vsco_downloader</a> by Micha Birklbauer.</p>
              <p className="small">Original library version inspected: 2.0.1. License: MIT.</p>
            </div>
            <div className="panel stepsCard">
              <h3>How it works</h3>
              {steps.map(([title, body], index) => (
                <div className="step" key={title}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{title}</strong>
                    <p>{body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="panel relatedCard">
              <h3>Related tools</h3>
              {allTools.filter((tool) => ["图片压缩", "图片格式转换", "API 接口测试", "JSON 格式化"].includes(tool.name)).map((tool) => (
                <button key={tool.name} onClick={() => openTool(tool)}>
                  <tool.icon size={17} />
                  {tool.name}
                </button>
              ))}
            </div>
          </aside>
        </section>

        <section className="vscoSeoSection">
          <div>
            <h2>VSCO downloader for raw image and video paths</h2>
            <p>This VSCO downloader extracts direct media paths from public VSCO post state without uploading pasted content to a server. It is useful for auditing post assets, archiving accessible media references, and testing VSCO media handling workflows.</p>
          </div>
          <div className="vscoNotesGrid">
            <article>
              <h3>Supported media</h3>
              <p>Responsive image URLs, video thumbnails, and MP4 video URLs exposed in VSCO post state.</p>
            </article>
            <article>
              <h3>Privacy model</h3>
              <p>Pasted HTML/JSON is parsed in memory in your browser. Exported TXT/JSON files are generated locally.</p>
            </article>
            <article>
              <h3>Production option</h3>
              <p>Add a backend proxy that fetches VSCO with server-side headers, then pass the HTML to this parser.</p>
            </article>
          </div>
        </section>

        <section className="toolBottomGrid vscoFaqGrid">
          <div className="panel faqPanel">
            <PanelTitle title="VSCO Downloader FAQ" action="Expand all" onAction={() => setActiveFaq(activeFaq === "all" ? null : "all")} />
            {faqs.map(([question, answer]) => (
              <div className="faqItem" key={question}>
                <button className="faqRow" onClick={() => setActiveFaq(activeFaq === question ? null : question)}>{question}<Plus size={17} /></button>
                {(activeFaq === question || activeFaq === "all") && <p>{answer}</p>}
              </div>
            ))}
          </div>
          <div className="panel articlePanel">
            <PanelTitle title="Developer note" action="Copy parser phrase" onAction={() => copyText("A simple python library to extract raw image and video paths from VSCO posts.", "SEO phrase")} />
            <p>The browser parser intentionally keeps the same data path as the Python package: `medias.byId → media → responsiveUrl/videoUrl`.</p>
            <pre>{`from vsco import get_links\nget_links("${VSCO_SAMPLE_URL}")`}</pre>
          </div>
        </section>
      </div>
    </main>
  );
}


export { VscoDownloaderPage };
