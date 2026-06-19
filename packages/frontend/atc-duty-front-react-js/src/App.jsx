import { useEffect } from "react";
import "./App.css";
import { useAppStore } from "./store/app.store";
import { AdminLayout } from "./app/layout/MainLayout";
import { Theme } from "@radix-ui/themes";
import { useUserStore } from "./store/user.store";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./app/AppRoutes";

function App() {
    const fetchPositions = useAppStore((s) => s.fetchPositions);
    const fetchAllDetailUsers = useUserStore((s) => s.fetchAllDetailUsers);

    useEffect(() => {
        fetchPositions();
        fetchAllDetailUsers();
    }, [fetchAllDetailUsers, fetchPositions]);

    return (
        <BrowserRouter>
            <Theme>
                <AdminLayout>
                    <AppRoutes />
                </AdminLayout>
            </Theme>
        </BrowserRouter>
    );
}

export default App;
