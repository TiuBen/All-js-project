import { useEffect } from "react";
import "./App.css";
import { useAppStore } from "./store/app.store";
import { AdminLayout } from "./app/layout/MainLayout";
import { Theme } from "@radix-ui/themes";
import { useUserStore } from "./store/user.store";
import { pageRegistry } from "./app/pageRegistry";
import ComingSoon from "./app/layout/ComingSoon";

import Router from "./app/Router";

// function App() {
//     const { page, fetchPositions } = useAppStore();
//     const { fetchAllDetailUsers } = useUserStore();

//     const Component = pageRegistry[page] === null ? ComingSoon : pageRegistry[page] ?? <div>NotFound</div>;

//     useEffect(() => {
//         fetchPositions();
//         fetchAllDetailUsers();
//     }, [fetchPositions, fetchAllDetailUsers]);

//     useEffect(() => {
//         console.log("page", page);
//     }, [page]);

//     return (
//         <Theme>
//             <AdminLayout>
//                 <Component />
//             </AdminLayout>
//         </Theme>
//     );
// }

function App() {
    const fetchPositions = useAppStore((s) => s.fetchPositions);
    const fetchAllDetailUsers = useUserStore((s) => s.fetchAllDetailUsers);

    useEffect(() => {
        fetchPositions();
        fetchAllDetailUsers();
    }, [fetchAllDetailUsers, fetchPositions]);

    return (
        <Theme>
            <AdminLayout>
                <Router />
            </AdminLayout>
        </Theme>
    );
}

export default App;
