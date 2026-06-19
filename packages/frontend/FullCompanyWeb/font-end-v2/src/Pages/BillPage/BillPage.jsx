import { useState, useEffect, useContext, createContext } from "react";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
import { TableBill, DisplayPageToolsBar, EditPageToolsBar, EditBill, DetailBill } from "./Components/index";
import { BillContext } from "./Context/BillContext";

function BillPage() {
    const [status, setStatus] = useState("DISPLAY");
    const location = useLocation();
    console.log(location);
    
    const [billHeader, setBillHeader] = useState({
        title: "",
        companyName: "",
        applyTime: dayjs().format("YYYY-MM-DD"),
    });
    const [selectedBillItemIndex, setSelectedBillItemIndex] = useState(0);
    const [billBody, setBillBody] = useState([
        { title: "111", price: 1, count: 111, attachment: {} },
        { title: "222", price: 2, count: 111, attachment: {} },
    ]);
    
    useEffect(() => {
        if (location) {
            if (location.pathname.includes("create")) {
                setStatus("create");
            }
            if (location.pathname.includes("detail")) {
                setStatus("detail");
            }
        }
        
    }, [status, location]);

    var content;

    if (status === "DISPLAY") {
        content = (
            <>
                <DisplayPageToolsBar />
                <TableBill />
            </>
        );
    }
    if (status === "detail") {
        content = (
            <>
                <EditPageToolsBar />
                <DetailBill />
            </>
        );
    }
    if (status === "create") {
        content = (
            <>
                <EditPageToolsBar />
                <EditBill />
            </>
        );
    }

    return (
        <BillContext.Provider
            value={{
                BillHeader: billHeader,
                SetBillHeader: setBillHeader,
                SelectedIndex: selectedBillItemIndex,
                SetSelectedIndex: setSelectedBillItemIndex,
                BillBody: billBody,
                SetBillBody: setBillBody,
            }}
        >
            <div className="flex flex-col flex-1 ">{content}</div>
        </BillContext.Provider>
    );
}

export default BillPage;
