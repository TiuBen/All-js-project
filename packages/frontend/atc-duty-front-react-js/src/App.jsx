import { useEffect } from "react";
import "./App.css";
import { useAppStore } from "./store/app.store";
import { AdminLayout } from "./app/layout/MainLayout";
import { resolvePage } from "./app/resolvePage";
import { Theme } from "@radix-ui/themes";

function App() {
    const PageComponent = resolvePage(page);

    useEffect(() => {
        fetchPositions();

    useEffect(() => {
        console.log("page", page);
    }, [page]);

    return (
        <Theme>
            <AdminLayout>{PageComponent()}</AdminLayout>
        </Theme>
    );
}

export default App;
