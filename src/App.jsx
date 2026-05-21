import React, { useMemo, useState } from "react";
import { ArrowRight } from "./shared/icons.js";
import { toolGroups } from "./data/siteData.jsx";
import { useI18n } from "./i18n/I18nProvider.jsx";
import { usePageSeo } from "./shared/utils.js";
import { Footer, Header, LoginForm, MessagePanel, Modal, ArticleView, SitePage, SubmitToolForm } from "./shared/components/Layout.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { getCategoryRoute, getCategoryRouteByCategory, getToolRoute, getToolRouteByTool, routeFromLocation, routeToPath } from "./tools/registry.jsx";
import "./styles/index.css";

const GenericTool = React.lazy(() => import("./tools/generic/GenericTool.jsx").then((module) => ({ default: module.GenericTool })));

function categoryFromRoute(routeId) {
  return getCategoryRoute(routeId)?.categoryId || "all";
}

function App() {
  const { locale } = useI18n();
  const [route, setRouteState] = useState(() => routeFromLocation());
  const [activeCategory, setActiveCategoryState] = useState(() => categoryFromRoute(routeFromLocation()));
  const [query, setQuery] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState(null);
  const [savedTools, setSavedTools] = useState(() => new Set(JSON.parse(localStorage.getItem("savedTools") || "[]")));
  const [genericTool, setGenericTool] = useState(null);
  const activeToolRoute = getToolRoute(route);
  usePageSeo(route, locale, activeToolRoute);

  const notify = React.useCallback((message) => {
    setToast(message);
    window.clearTimeout(window.__toolboxToastTimer);
    window.__toolboxToastTimer = window.setTimeout(() => setToast(""), 2400);
  }, []);

  const toggleSave = React.useCallback((toolName) => {
    setSavedTools((current) => {
      const next = new Set(current);
      if (next.has(toolName)) {
        next.delete(toolName);
        notify(`已取消收藏：${toolName}`);
      } else {
        next.add(toolName);
        notify(`已收藏：${toolName}`);
      }
      localStorage.setItem("savedTools", JSON.stringify([...next]));
      return next;
    });
  }, [notify]);

  const setRoute = React.useCallback((next) => {
    setRouteState(next);
    setActiveCategoryState(categoryFromRoute(next));
    const nextPath = routeToPath(next);
    if (window.location.pathname !== nextPath || window.location.hash) {
      window.history.pushState({ route: next }, "", nextPath);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const setActiveCategory = React.useCallback((nextCategory) => {
    setActiveCategoryState(nextCategory);
    const categoryRoute = getCategoryRouteByCategory(nextCategory);
    const nextRoute = categoryRoute?.id || "home";
    const nextPath = categoryRoute?.path || "/";
    setRouteState(nextRoute);
    if (window.location.pathname !== nextPath || window.location.hash) {
      window.history.pushState({ route: nextRoute }, "", nextPath);
    }
  }, []);

  const openTool = React.useCallback((tool) => {
    const routeForTool = getToolRouteByTool(tool);
    if (routeForTool) {
      setRoute(routeForTool.id);
      return;
    }
    setGenericTool(tool);
    setModal({ type: "generic-tool", title: tool.name });
  }, [setRoute]);

  React.useEffect(() => {
    const onLocationChange = () => {
      const nextRoute = routeFromLocation();
      setRouteState(nextRoute);
      setActiveCategoryState(categoryFromRoute(nextRoute));
    };
    const initialRoute = routeFromLocation();
    const currentPath = routeToPath(initialRoute);
    if (window.location.pathname !== currentPath || window.location.hash) {
      window.history.replaceState({ route: initialRoute }, "", currentPath);
    }
    window.addEventListener("popstate", onLocationChange);
    window.addEventListener("hashchange", onLocationChange);
    return () => {
      window.removeEventListener("popstate", onLocationChange);
      window.removeEventListener("hashchange", onLocationChange);
    };
  }, []);

  const visibleGroups = useMemo(() => {
    if (activeCategory === "all") return toolGroups;
    return toolGroups.filter((group) => group.id === activeCategory);
  }, [activeCategory]);

  return (
    <div className="app">
      <Header setRoute={setRoute} route={route} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} notify={notify} setModal={setModal} setActiveCategory={setActiveCategory} />
      {route === "home" ? (
        <HomePage
          query={query}
          setQuery={setQuery}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          visibleGroups={visibleGroups}
          setRoute={setRoute}
          notify={notify}
          setModal={setModal}
          openTool={openTool}
        />
      ) : activeToolRoute ? (
        <React.Suspense fallback={<div className="emptyState panel">工具加载中...</div>}>
          <activeToolRoute.Component tool={activeToolRoute.tool} setRoute={setRoute} setActiveCategory={setActiveCategory} notify={notify} setModal={setModal} toggleSave={toggleSave} savedTools={savedTools} openTool={openTool} />
        </React.Suspense>
      ) : (
        <HomePage
          query={query}
          setQuery={setQuery}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          visibleGroups={visibleGroups}
          setRoute={setRoute}
          notify={notify}
          setModal={setModal}
          openTool={openTool}
        />
      )}
      <Footer setRoute={setRoute} notify={notify} setModal={setModal} setActiveCategory={setActiveCategory} />
      <button className="floatingTop" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top">
        <ArrowRight size={18} />
      </button>
      {toast && <div className="toast" role="status">{toast}</div>}
      {modal && (
        <Modal title={modal.title} onClose={() => setModal(null)}>
          {modal.type === "submit" && <SubmitToolForm notify={notify} onClose={() => setModal(null)} />}
          {modal.type === "login" && <LoginForm notify={notify} onClose={() => setModal(null)} />}
          {modal.type === "article" && <ArticleView article={modal.article} />}
          {modal.type === "generic-tool" && (modal.toolOverride || genericTool) && (
            <React.Suspense fallback={<p className="messagePanel">工具加载中...</p>}>
              <GenericTool tool={modal.toolOverride || genericTool} notify={notify} toggleSave={toggleSave} saved={savedTools.has((modal.toolOverride || genericTool).name)} />
            </React.Suspense>
          )}
          {modal.type === "page" && <SitePage page={modal.page} setModal={setModal} notify={notify} openTool={openTool} />}
          {modal.type === "message" && <MessagePanel message={modal.message} />}
        </Modal>
      )}
    </div>
  );
}

export default App;
