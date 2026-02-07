import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// import App from './App.jsx'
import "@radix-ui/themes/styles.css";

import AppSkeleton from "./v1-skeleton/AppSkeleton.jsx";
import AppV2 from "./V2-dashboard/AppV2.jsx";
import AppV3 from "./V3/AppV3.jsx";
import AppMobile from "./V4-MobileOnly/AppMobile.jsx";
import EditDutyRecord from "./V3/Page2/SheetPage/LikeExcel/EditDutyRecord.jsx";
import AppV5 from "./V5-new-skeleton/routes.js";
import AppV6 from "./V6-store/AppV6.jsx";
import AppV7 from "./V7/AppV7.jsx";
import TestStore from "./V7/TestStore.jsx";

createRoot(document.getElementById("root")).render(
    // <AppMobile />
    <AppV7 />
    // <TestStore />

    // <AppV3 />
    // <AppV5 />
    // <AppV6 />
);

// <StrictMode>
{
    /* <App /> */
}
{
    /* <AppSkeleton /> */
}
{
    /* <AppV2 /> */
}
{
    /* <EditDutyRecord /> */
}
// </StrictMode>
