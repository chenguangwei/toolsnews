import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { categoryNames, defaultLocale, locales, messages } from "./messages.js";

const I18nContext = createContext(null);

function resolveLocale(value) {
  return locales.some((locale) => locale.id === value) ? value : defaultLocale;
}

function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() => resolveLocale(localStorage.getItem("toolboxLocale") || defaultLocale));

  const setLocale = React.useCallback((nextLocale) => {
    const resolved = resolveLocale(nextLocale);
    setLocaleState(resolved);
    localStorage.setItem("toolboxLocale", resolved);
  }, []);

  useEffect(() => {
    const htmlLang = locales.find((item) => item.id === locale)?.htmlLang || locale;
    document.documentElement.lang = htmlLang;
  }, [locale]);

  const value = useMemo(() => {
    const currentMessages = messages[locale] || messages[defaultLocale];
    const currentCategories = categoryNames[locale] || categoryNames[defaultLocale];
    return {
      locale,
      locales,
      setLocale,
      messages: currentMessages,
      categories: currentCategories,
      categoryName: (id) => currentCategories[id] || categoryNames[defaultLocale][id] || id
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function useI18n() {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return value;
}

export { I18nProvider, useI18n };
