const VSCO_SAMPLE_URL = "https://vsco.co/emilieristevski/media/561f648001146426743090fa";
const VSCO_DEMO_STATE = JSON.stringify({
  medias: {
    byId: {
      sampleImage: {
        media: {
          isVideo: false,
          responsiveUrl: "im.vsco.co/1/51a9887c50f8151/561f648001146426743090fa/vsco_101515.jpg"
        }
      },
      sampleVideo: {
        media: {
          isVideo: true,
          responsiveUrl: "im.vsco.co/aws-us-west-2/aaf64f/597912/5c61243fbbb29b6617e3d26c/5c61243fbbb29b6617e3d26c.jpg",
          videoUrl: "img.vsco.co/aaf64f/597912/5c61243fbbb29b6617e3d26c/5c61243fbbb29b6617e3d26c.mp4"
        }
      }
    }
  }
}, null, 2);

function normalizeVscoMediaUrl(value) {
  if (!value || typeof value !== "string") return "";
  const decoded = value.replace(/\\\//g, "/").trim();
  if (/^https?:\/\//i.test(decoded)) return decoded;
  if (decoded.startsWith("//")) return `https:${decoded}`;
  return `https://${decoded.replace(/^\/+/, "")}`;
}

function cleanVscoPreloadedState(raw) {
  return raw
    .trim()
    .replace(/;$/, "")
    .replace(/\bundefined\b/g, '""')
    .replace(/\\x/g, "\\u00")
    .replace(/(?<!\\)\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, "");
}

function extractVscoStateText(input) {
  const text = input.trim();
  if (!text) throw new Error("Paste a VSCO page HTML, __PRELOADED_STATE__ JSON, or a supported proxy response.");
  const marker = "window.__PRELOADED_STATE__ =";
  if (text.includes(marker)) {
    const afterMarker = text.split(marker)[1] || "";
    return afterMarker.split("</script>")[0] || afterMarker;
  }
  const scriptMatch = text.match(/<script[^>]*>\s*window\.__PRELOADED_STATE__\s*=\s*([\s\S]*?)<\/script>/i);
  if (scriptMatch?.[1]) return scriptMatch[1];
  return text;
}

function inferVscoKind(url, sourceKind) {
  if (/\.mp4($|\?)/i.test(url)) return "video";
  if (/\.jpe?g|\.png|\.webp/i.test(url) && sourceKind === "video-thumbnail") return "thumbnail";
  if (/\.jpe?g|\.png|\.webp/i.test(url)) return "image";
  return sourceKind || "media";
}

function collectVscoUrlsFromJson(jsonData, includeVideoThumbnails) {
  const medias = jsonData?.medias?.byId;
  if (!medias || typeof medias !== "object") return [];
  const results = [];
  Object.entries(medias).forEach(([id, entry]) => {
    const info = entry?.media || entry;
    if (!info || typeof info !== "object") return;
    const isVideo = Boolean(info.isVideo);
    if ((!isVideo || includeVideoThumbnails) && info.responsiveUrl) {
      const url = normalizeVscoMediaUrl(info.responsiveUrl);
      if (url) results.push({ id, type: inferVscoKind(url, isVideo ? "video-thumbnail" : "image"), url });
    }
    if (isVideo && info.videoUrl) {
      const url = normalizeVscoMediaUrl(info.videoUrl);
      if (url) results.push({ id, type: "video", url });
    }
  });
  return results;
}

function collectVscoUrlsByRegex(input, includeVideoThumbnails) {
  const mediaMatches = input.match(/(?:https?:)?\/\/(?:im|img)\.vsco\.co\/[^"' <>)\\]+|(?:im|img)\.vsco\.co\/[^"' <>)\\]+/gi) || [];
  return mediaMatches
    .map((url, index) => {
      const normalized = normalizeVscoMediaUrl(url);
      const type = inferVscoKind(normalized);
      return { id: `regex-${index + 1}`, type, url: normalized };
    })
    .filter((item) => includeVideoThumbnails || item.type !== "thumbnail");
}

function dedupeVscoResults(results) {
  const seen = new Set();
  return results.filter((item) => {
    if (!item.url || seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

function parseVscoMedia(input, includeVideoThumbnails = true) {
  const stateText = extractVscoStateText(input);
  try {
    const jsonData = JSON.parse(cleanVscoPreloadedState(stateText));
    const results = dedupeVscoResults(collectVscoUrlsFromJson(jsonData, includeVideoThumbnails));
    if (results.length) return results;
  } catch (_error) {
    // Regex fallback below supports pasted snippets that are not valid JSON.
  }
  const regexResults = dedupeVscoResults(collectVscoUrlsByRegex(input, includeVideoThumbnails));
  if (regexResults.length) return regexResults;
  throw new Error("No VSCO media URLs were found. Paste the full VSCO post HTML or the window.__PRELOADED_STATE__ JSON.");
}

function vscoFileName(url, index) {
  try {
    const parsed = new URL(url);
    return parsed.pathname.split("/").filter(Boolean).pop() || `vsco-media-${index + 1}`;
  } catch (_error) {
    return `vsco-media-${index + 1}`;
  }
}

export {
  VSCO_SAMPLE_URL,
  VSCO_DEMO_STATE,
  parseVscoMedia,
  vscoFileName
};
