import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import "./Tab.scss";

const Tab = ({ tabs, defaultTab }) => {
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const location = useLocation();
    const navigate = useNavigate();
    const handleClick = (tab) => {
        console.log("dianji:" + JSON.stringify(tab));
        setActiveTab(tab);
        if (tab.url) {
            navigate(tab.url);
        } else {
            navigate(".");
        }
    };

    useEffect(() => {
        console.log(location);
    }, [location]);

    return (
        <div className="tab-container ">
            {tabs.map((tab, index) => (
                <button
                    key={index}
                    index={index}
                    onClick={() => handleClick(tab)}
                    className={`tab-item ${index === defaultTab ? "checked" : "not-checked"}`}
                >
                    {index + ":" + tab.title + ":" + tab.url}
                </button>
            ))}
            {JSON.stringify(activeTab)}
        </div>
    );
};

const TabTest = (props) => {
    const tabs = ["新建", "查看", "审核", "Very Long Tab 4"];
    const defaultTab = "Tab 1";

    return (
        <div className="max-w-lg mx-auto p-8 bg-red-400">
            <h1 className="text-3xl font-bold mb-4">Tab Example</h1>
            <Tab tabs={tabs} defaultTab={defaultTab} />
        </div>
    );
};

export { Tab, TabTest };
