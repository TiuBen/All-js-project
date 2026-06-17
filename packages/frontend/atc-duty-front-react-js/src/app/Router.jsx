// src/app/Router.jsx

import { useEffect } from "react";
import { ROUTES } from "./routes";
import { useRouterStore } from "../store/router.store";
import NotFound from "./layout/NotFound";

export default function Router() {
    const pathname = useRouterStore((s) => s.pathname);

    console.log("router pathname:", pathname, ROUTES[pathname]);
    const sync = useRouterStore((s) => s.sync);

    useEffect(() => {
        const handler = () => {
            sync();
        };

        window.addEventListener("popstate", handler);

        return () => {
            window.removeEventListener("popstate", handler);
        };
    }, [sync]);

    const route = ROUTES[pathname];

    if (!route) {
        return <NotFound />;
    }

    const Component = route.component;

    return <Component />;
}
