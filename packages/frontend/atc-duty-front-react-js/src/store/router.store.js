// src/store/router.store.js

import { create } from "zustand";
import { ROUTES } from "../app/routes";

function getCurrentPath() {
    return window.location.pathname;
}

export const useRouterStore = create((set) => ({
    pathname: getCurrentPath(),

    push(path) {
        console.log("push:", path);

        if (window.location.pathname === path) return;

        // if (!path.startsWith("/")) path = "/" + path;

        window.history.pushState({}, "", path);

        set({
            pathname: path,
        });
    },

    replace(path) {
        window.history.replaceState({}, "", path);

        set({
            pathname: path,
        });
    },

    sync() {
        set({
            pathname: window.location.pathname,
        });
    },
}));
