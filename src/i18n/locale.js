import { defaultLocale, locales } from "./messages.js";

const localeIds = new Set(locales.map((locale) => locale.id));

function resolveLocale(value) {
  return localeIds.has(value) ? value : defaultLocale;
}

function normalizeBrowserLocale(value) {
  if (!value || typeof value !== "string") return "";
  const normalized = value.trim().toLowerCase().replace("_", "-");
  if (!normalized) return "";
  const language = normalized.split("-")[0];
  return localeIds.has(language) ? language : "";
}

function detectBrowserLocale(languageValues = []) {
  const candidates = Array.isArray(languageValues) ? languageValues : [languageValues];
  const matched = candidates.map(normalizeBrowserLocale).find(Boolean);
  return matched || defaultLocale;
}

function getInitialLocale(storage = globalThis.localStorage, navigatorLike = globalThis.navigator) {
  let storedLocale = "";
  try {
    storedLocale = storage?.getItem?.("toolboxLocale") || "";
  } catch {
    storedLocale = "";
  }
  if (localeIds.has(storedLocale)) return storedLocale;
  return detectBrowserLocale([...(navigatorLike?.languages || []), navigatorLike?.language].filter(Boolean));
}

export { detectBrowserLocale, getInitialLocale, normalizeBrowserLocale, resolveLocale };
