import React from "react";
import { allTools, categories } from "../data/siteData.jsx";
import { getToolRouteId } from "./slugs.js";

const specialToolRoutes = [
  {
    id: "pdf-word",
    path: "/tools/pdf-word",
    Component: React.lazy(() => import("./pdf/PdfWordToolPage.jsx").then((module) => ({ default: module.PdfWordToolPage })))
  },
  {
    id: "jsx-to-jsxbin",
    path: "/tools/jsx-to-jsxbin",
    Component: React.lazy(() => import("./jsxbin/Pages.jsx").then((module) => ({ default: module.JsxbinToolPage })))
  },
  {
    id: "jsxbin-to-jsx",
    path: "/tools/jsxbin-to-jsx",
    Component: React.lazy(() => import("./jsxbin/Pages.jsx").then((module) => ({ default: module.JsxbinDecodePage })))
  },
  {
    id: "vsco-downloader",
    path: "/tools/vsco-downloader",
    Component: React.lazy(() => import("./vsco-downloader/VscoDownloaderPage.jsx").then((module) => ({ default: module.VscoDownloaderPage })))
  }
];

const GenericToolPage = React.lazy(() => import("./generic/GenericToolPage.jsx").then((module) => ({ default: module.GenericToolPage })));
const specialRouteIds = new Set(specialToolRoutes.map((route) => route.id));
const genericToolRoutes = allTools
  .map((tool) => ({ tool, id: getToolRouteId(tool) }))
  .filter(({ id }) => id && !specialRouteIds.has(id))
  .map(({ id, tool }) => ({
    id,
    path: `/tools/${id}`,
    tool,
    Component: GenericToolPage
  }));

const toolRoutes = [...specialToolRoutes, ...genericToolRoutes];
const toolRouteMap = new Map(toolRoutes.map((route) => [route.id, route]));
const toolNameRouteMap = new Map(allTools.map((tool) => [tool.name, getToolRouteId(tool)]).filter(([, routeId]) => routeId));
const categoryRoutes = categories
  .filter((category) => category.id !== "all")
  .map((category) => ({
    id: `category-${category.id}`,
    path: `/categories/${category.id}`,
    categoryId: category.id
  }));
const categoryRouteMap = new Map(categoryRoutes.map((route) => [route.id, route]));
const categoryIdRouteMap = new Map(categoryRoutes.map((route) => [route.categoryId, route]));

function getToolRoute(routeId) {
  return toolRouteMap.get(routeId) || null;
}

function getToolRouteByTool(tool) {
  return tool ? getToolRoute(tool.route || toolNameRouteMap.get(tool.name)) : null;
}

function getCategoryRoute(routeId) {
  return categoryRouteMap.get(routeId) || null;
}

function getCategoryRouteByCategory(categoryId) {
  return categoryIdRouteMap.get(categoryId) || null;
}

function routeFromLocation(location = window.location) {
  const path = location.pathname || "/";
  const hashPath = location.hash.replace(/^#/, "");
  const categoryMatch = categoryRoutes.find((route) => route.path === path || hashPath === route.path || hashPath === `/${route.categoryId}`);
  if (categoryMatch) return categoryMatch.id;
  const match = toolRoutes.find((route) => route.path === path || route.path === `/tools${hashPath}` || hashPath === `/${route.id}`);
  if (match) return match.id;
  const legacyMatch = toolRoutes.find((route) => location.hash.includes(route.id) || path === `/${route.id}`);
  return legacyMatch?.id || "home";
}

function routeToPath(routeId) {
  return getToolRoute(routeId)?.path || getCategoryRoute(routeId)?.path || "/";
}

export {
  categoryRoutes,
  getCategoryRoute,
  getCategoryRouteByCategory,
  getToolRoute,
  getToolRouteByTool,
  routeFromLocation,
  routeToPath,
  toolRoutes
};
