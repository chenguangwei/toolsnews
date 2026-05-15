import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import pptxgen from "pptxgenjs";
import JSZip from "jszip";
import { toCsv } from "../../shared/utils.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function normalizePdfToolName(name) {
  return name.replace(/\s+/g, "");
}

function parsePageRange(rangeText, totalPages) {
  if (!rangeText.trim()) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const pages = new Set();
  for (const chunk of rangeText.split(",")) {
    const part = chunk.trim();
    if (!part) continue;
    if (part.includes("-")) {
      const [start, end] = part.split("-").map((value) => Number(value.trim()));
      if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
      for (let page = Math.max(1, start); page <= Math.min(totalPages, end); page += 1) pages.add(page);
    } else {
      const page = Number(part);
      if (Number.isFinite(page) && page >= 1 && page <= totalPages) pages.add(page);
    }
  }
  return [...pages].sort((a, b) => a - b);
}

async function extractPdfText(file, rangeMode, rangeText) {
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pages = rangeMode === "pages" ? parsePageRange(rangeText, pdf.numPages) : Array.from({ length: pdf.numPages }, (_, index) => index + 1);
  if (!pages.length) throw new Error("页码范围无效，请输入例如 1-3, 5 的格式。");
  const paragraphs = [];
  for (const pageNumber of pages) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str).join(" ").replace(/\s+/g, " ").trim();
    paragraphs.push({ page: pageNumber, text: text || "该页未提取到可复制文本。" });
  }
  return paragraphs;
}

async function buildDocxFromPdf(file, paragraphs) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: `由智用工具站转换：${file.name}`, bold: true, size: 28 })]
          }),
          ...paragraphs.flatMap((item) => [
            new Paragraph({ children: [new TextRun({ text: `第 ${item.page} 页`, bold: true, size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: item.text, size: 22 })] })
          ])
        ]
      }
    ]
  });
  return Packer.toBlob(doc);
}

async function extractPdfPageTexts(file) {
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str).join(" ").replace(/\s+/g, " ").trim();
    pages.push({ page: pageNumber, text: text || `第 ${pageNumber} 页未提取到文本` });
  }
  return pages;
}


async function renderPdfPagesToZip(file) {
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const zip = new JSZip();
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.6 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    zip.file(`page-${String(pageNumber).padStart(2, "0")}.png`, blob);
  }
  return zip.generateAsync({ type: "blob" });
}

async function mergePdfs(files) {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const pdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
    const pages = await merged.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }
  return new Blob([await merged.save()], { type: "application/pdf" });
}

async function splitPdf(file) {
  const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const zip = new JSZip();
  for (let index = 0; index < source.getPageCount(); index += 1) {
    const out = await PDFDocument.create();
    const [page] = await out.copyPages(source, [index]);
    out.addPage(page);
    zip.file(`page-${index + 1}.pdf`, await out.save());
  }
  return zip.generateAsync({ type: "blob" });
}

async function signPdf(file, signature) {
  const pdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  for (const page of pdf.getPages()) {
    const { width } = page.getSize();
    page.drawText(signature || "Signed by ToolBox Hub", {
      x: width - 230,
      y: 36,
      size: 13,
      font,
      color: rgb(0.12, 0.38, 0.9)
    });
  }
  return new Blob([await pdf.save()], { type: "application/pdf" });
}

async function pdfToPptx(file) {
  const pages = await extractPdfPageTexts(file);
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pages.forEach((item) => {
    const slide = pptx.addSlide();
    slide.background = { color: "F6F9FF" };
    slide.addText(`PDF 第 ${item.page} 页`, { x: 0.45, y: 0.35, w: 12.4, h: 0.42, fontSize: 20, bold: true, color: "164FF2" });
    slide.addText(item.text, { x: 0.55, y: 1.05, w: 12.0, h: 5.8, fontSize: 16, color: "17213C", breakLine: false, fit: "shrink" });
  });
  return pptx.write({ outputType: "blob" });
}

async function runPdfOperation(name, files, extraText = "") {
  const cleanName = normalizePdfToolName(name);
  if (!files.length) throw new Error("请先选择 PDF 文件。");
  if (cleanName === "PDF转Word") {
    const paragraphs = await extractPdfText(files[0], "all", "");
    return { blob: await buildDocxFromPdf(files[0], paragraphs), fileName: `${files[0].name.replace(/\.pdf$/i, "")}.docx`, note: "已生成可编辑 DOCX 文档。" };
  }
  if (cleanName === "PDF转Excel") {
    const pages = await extractPdfPageTexts(files[0]);
    return { blob: new Blob([toCsv([["page", "text"], ...pages.map((item) => [item.page, item.text])])], { type: "text/csv;charset=utf-8" }), fileName: `${files[0].name.replace(/\.pdf$/i, "")}.csv`, note: "已把 PDF 文本按页导出为 CSV，可用 Excel 打开。" };
  }
  if (cleanName === "PDF转PPT") {
    return { blob: await pdfToPptx(files[0]), fileName: `${files[0].name.replace(/\.pdf$/i, "")}.pptx`, note: "已按 PDF 页面文本生成 PPTX。" };
  }
  if (cleanName === "PDF转图片") {
    return { blob: await renderPdfPagesToZip(files[0]), fileName: `${files[0].name.replace(/\.pdf$/i, "")}-images.zip`, note: "已把 PDF 页面渲染为 PNG 并打包。" };
  }
  if (cleanName === "PDF合并") {
    if (files.length < 2) throw new Error("PDF 合并至少需要选择 2 个 PDF 文件。");
    return { blob: await mergePdfs(files), fileName: "merged.pdf", note: `已合并 ${files.length} 个 PDF。` };
  }
  if (cleanName === "PDF拆分") {
    return { blob: await splitPdf(files[0]), fileName: `${files[0].name.replace(/\.pdf$/i, "")}-split.zip`, note: "已按页拆分并打包为 ZIP。" };
  }
  if (cleanName === "PDF签名") {
    return { blob: await signPdf(files[0], extraText), fileName: `${files[0].name.replace(/\.pdf$/i, "")}-signed.pdf`, note: "已在每页右下角添加签名文本。" };
  }
  if (cleanName === "PDF压缩") {
    const pdf = await PDFDocument.load(await files[0].arrayBuffer(), { ignoreEncryption: true });
    return { blob: new Blob([await pdf.save({ useObjectStreams: true })], { type: "application/pdf" }), fileName: `${files[0].name.replace(/\.pdf$/i, "")}-optimized.pdf`, note: "已重新写入并优化 PDF 结构。图片重采样压缩需要后端图像处理服务。" };
  }
  if (cleanName === "PDF加密" || cleanName === "PDF解密") {
    throw new Error("PDF 加密/解密需要密码安全模块或后端服务，浏览器本地库不能可靠处理。");
  }
  if (cleanName === "Word转PDF") {
    throw new Error("Word 转 PDF 需要 Word/WPS 渲染引擎或服务器端排版服务，纯浏览器无法保证版式。");
  }
  throw new Error("该 PDF 工具暂未配置处理逻辑。");
}

export {
  parsePageRange,
  extractPdfText,
  buildDocxFromPdf,
  extractPdfPageTexts,
  renderPdfPagesToZip,
  mergePdfs,
  splitPdf,
  signPdf,
  pdfToPptx,
  runPdfOperation
};
