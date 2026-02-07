import React, { useEffect, useState, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, Link } from "react-router-dom";
import { SERVER_URL } from "../utils/const/Const";
import SideNavBar from "./layouts/SideNavBar";
import AdminLayout from "./layouts/AdminLayout";
import HorizontalNavBar from "./layouts/HorizontalNavBar";

const DynamicPage = () => {
    const [component, setComponent] = useState(null);
    const { pathname } = useLocation();

    useEffect(() => {
        console.log("pathname", pathname);

        const loadComponent = async () => {
            try {
                // 从后端获取路由配置
                const response = await fetch(`${SERVER_URL}/pages`);
                const pages = await response.json();
                console.log("pages", pages);

                const page = pages.find((p) => p.path === pathname);
                console.log(page);
                if (page) {
                    const { component } = page;
                    // 动态导入组件（例如：Page1.jsx、Page2.jsx 等）
                    const Component = React.lazy(() => import(`./pages/${component}.jsx`));
                    setComponent(<Component />);
                }
            } catch (error) {
                console.error("Error loading page component:", error);
            }
        };

        loadComponent();
    }, [pathname]);

    return component ? <Suspense fallback={<div>error...</div>}>{component}</Suspense> : <div>Loading...</div>;
};

// const AppV5 = () => (
//     <Router>
//         <Routes>
//             <Route
//                 path="/"
//                 element={
//                     <h1>
//                         Welcome Home
//                         <Link to="/page1">page1</Link>
//                         <Link to="/page1">page1</Link>
//                     </h1>
//                 }
//             />
//             <Route path="/page1" element={<DynamicPage />} />
//             <Route path="/page2" element={<DynamicPage />} />
//         </Routes>
//     </Router>
// );

function AppV5() {
    return (
        <AdminLayout sideNavBar={<SideNavBar />} horizontalNavBar={<HorizontalNavBar />}>
            <Routes>
                <Route path="/" element={<DynamicPage />} />
                <Route path="/page1" element={<DynamicPage />} />
                <Route path="/page2" element={<DynamicPage />} />
            </Routes>
        </AdminLayout>
    );
}

export default AppV5;

// export default routes
