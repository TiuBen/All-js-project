import { BrowserRouter, Routes, Route, createBrowserRouter, useRouteError } from "react-router-dom";
import "./App.css";
import "antd/dist/reset.css";

import { SiteMainPage } from "./pages/index.js";
import { TestWorkerInformation, TestServiceHook, TestLayoutMainPage } from "__test__/index.js";
import TestService from "__test__/_test_component/TestService";
import { MsCalendar } from "components/MSCalendar";
import Add from "components/ErpComponents/AddSupplier";
import ErpMainPage from "components/ErpComponents/ErpMainPage";
import ErpSupplierPage from "components/ErpComponents/ErpSupplierPage";
import TestConnectBackend from "components/TestConnectBackend/TestConnectBackend";
import SampleOrderTable from "components/FanOrderForms/SampleOrderTable";
import Price from "components/ErpComponents/Price";

function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    return (
        <div id="error-page">
            <h1>Oops!</h1>
            <p>Sorry, an unexpected error has occurred.</p>
            <p>
                <i>{error.statusText || error.message}</i>
            </p>
        </div>
    );
}

const router = createBrowserRouter([
    {
        path: "/",
        element: <TestLayoutMainPage />,
        errorElement: <ErrorPage />,
    },
]);

const TestOutlet = () => <h1>test ERP 鼎道风扇</h1>;

const App = () => (
    <div className="App">
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<TestLayoutMainPage />} errorElement={<ErrorPage />}>
                    <Route index element={<MsCalendar />} />
                    <Route path="erp" element={<ErpMainPage />} />
                    <Route path="/erp/dd/supplier" element={<ErpSupplierPage />} />
                    <Route path="/erp/dd/price" element={<Price />} />
                    <Route path="test" element={<SampleOrderTable />} />
                    <Route path="test2" element={<Price />} />
                </Route>
            </Routes>
        </BrowserRouter>
        {/* <TestService /> */}
    </div>
);

export default App;
