// src/router.jsx
import { createRootRoute, createRoute, createRouter, Outlet, RouterProvider, Link } from "@tanstack/react-router";
import MainLayout from "./layout/MainLayout";
import InDutyFlightsPage from "./pages/InDutyFlightsPage";
import CalendarFlightsPage from "./pages/CalendarFlightsPage";

// 根路由（包含 Layout）
const rootRoute = createRootRoute({
    component: MainLayout,
});

// 子路由
const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: InDutyFlightsPage,
});

const calendarRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/calendar",
    component: CalendarFlightsPage,
});

const notFoundRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "*",
    component: () => <div>404 - Page Not Found</div>,
});

// 创建路由树
const routeTree = rootRoute.addChildren([homeRoute, calendarRoute, notFoundRoute]);

export const router = createRouter({ routeTree });
