import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import MainPageLayout from "./AtcLicenseExam/MainPageLayout";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { BrowserRouter, Routes, Route, Outlet, Link, useLocation } from "react-router-dom";
import QEditor from "./Atctiku/QEditor";
import SelfTest from "./AtcLicenseExam/SelfTest";
import Layout from "AtcLicenseExam/Exam/Layout";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
    // <App />
    <Theme>
        <BrowserRouter>
            <Routes>
                <Route index element={<MainPageLayout />} />
                <Route path="/editor*" element={<QEditor />} />
                <Route path="test" element={<SelfTest />} />
                <Route path="/exam" element={<Layout />} />
            </Routes>
        </BrowserRouter>
    </Theme>
    // <React.StrictMode>
    // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
