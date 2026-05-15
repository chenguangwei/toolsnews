import React from "react";

const toolRoutes = [
  {
    id: "pdf-word",
    hashPath: "/pdf-word",
    Component: React.lazy(() => import("./pdf/PdfWordToolPage.jsx").then((module) => ({ default: module.PdfWordToolPage })))
  },
  {
    id: "jsx-to-jsxbin",
    hashPath: "/jsx-to-jsxbin",
    Component: React.lazy(() => import("./jsxbin/Pages.jsx").then((module) => ({ default: module.JsxbinToolPage })))
  },
  {
    id: "jsxbin-to-jsx",
    hashPath: "/jsxbin-to-jsx",
    Component: React.lazy(() => import("./jsxbin/Pages.jsx").then((module) => ({ default: module.JsxbinDecodePage })))
  },
  {
    id: "vsco-downloader",
    hashPath: "/vsco-downloader",
    Component: React.lazy(() => import("./vsco-downloader/VscoDownloaderPage.jsx").then((module) => ({ default: module.VscoDownloaderPage })))
  }
];

const toolRouteMap = new Map(toolRoutes.map((route) => [route.id, route]));

function getToolRoute(routeId) {
  return toolRouteMap.get(routeId) || null;
}

function routeFromHash(hash = window.location.hash) {
  const match = toolRoutes.find((route) => hash.includes(route.id));
  return match?.id || "home";
}

function routeToHash(routeId) {
  return getToolRoute(routeId)?.hashPath || "/";
}

export { getToolRoute, routeFromHash, routeToHash, toolRoutes };
