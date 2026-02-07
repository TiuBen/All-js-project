import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "@radix-ui/themes/styles.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";


import { Theme } from "@radix-ui/themes";


import TestRouteApp from "./AppTestRoute/TestRouteApp";
import AppV2 from "./V2/IndexPage";

// import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

// const body = ReactDOM.findDOMNode(document.getElementsByClassName("body"));
// body.render(
//     // <Theme style={{display:"flex",flexDirection:"column"}}>
//     <Theme >
//     </Theme>
// );

const root = ReactDOM.createRoot(document.getElementById("root"));

console.log(process.env.REACT_APP_SERVER_URL);

// Check if service workers are supported by the browser
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//       navigator.serviceWorker.register('/service-worker.js').then(
//         (registration) => {
//           console.log('Service Worker registered with scope: ', registration.scope);
//         },
//         (error) => {
//           console.log('Service Worker registration failed: ', error);
//         }
//       );
//     });
//   }

root.render(
    // <Theme style={{display:"flex",flexDirection:"column"}}>
    <Theme>
        <React.StrictMode>
            {/* <TestRouteApp /> */}
            <AppV2/>
        </React.StrictMode>
    </Theme>
);

//*
// serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
