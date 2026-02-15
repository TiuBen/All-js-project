import { useState,useEffect } from "react";
import "./App.css";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";

import type { UserModel } from "./util/models/generated/models";
import React from "react";
import { PageRouter } from "./app/router/usePageRouter";
import { AdminLayout } from "./app/layout/MainLayout";
import { useAppStore } from "./store/app.store";

function App() {
    const [count, setCount] = useState(0);
    const fetchPositions = useAppStore((s) => s.fetchPositions);
    useEffect(() => {
        fetchPositions();
    }, []);

    const newUser: UserModel = {
        id: 1,
        username: "test",
        password: "test",
        availablePositionAndRoleType: [
            {
                positionId: 1,
                roleTypes: ["教员", "管制"],
            },
        ],
    };

    console.log(newUser);

    return (
        <Theme>
            <AdminLayout>
                <PageRouter />
            </AdminLayout>
        </Theme>
    );
}

export default App;
