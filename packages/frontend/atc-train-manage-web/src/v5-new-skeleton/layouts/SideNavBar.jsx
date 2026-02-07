import React, { useState } from "react";
import useNavbarStore from "../store/navbarStore";
import { ChevronLeft, ChevronRight, ChevronDown, Home, Settings, Users, FileText } from "lucide-react";

const navItems = [
    {
        icon: <Home size={24} />,
        text: "Home",
        link: "/",
    },
    {
        icon: <Settings size={24} />,
        text: "Settings",
        link: "/settings",
        items: [
            {
                icon: <Users size={20} />,
                text: "Users",
                link: "/settings/users",
            },
            {
                icon: <FileText size={20} />,
                text: "Documents",
                link: "/settings/documents",
            },
        ],
    },
];

const SideNavBarItem = ({ icon, text, items }) => {
    const { isOpen } = useNavbarStore();
    const [isExpand, setIsExpand] = useState(true);
    const hasItems = items && items.length > 0;
    return (
        <li className="mb-2">
            <div className="flex flex-row flex-nowrap  justify-between">
                <label
                    className={`flex flex-1 items-center gap-2 hover:text-white rounded ${
                        hasItems ? "text-lg " : "text-sm "
                    }`}
                >
                    {icon}
                    {isOpen ? `${text}` : ""}
                </label>
                {isOpen && hasItems && (
                    <button
                        onClick={() => setIsExpand(!isExpand)}
                        className="p-2 rounded hover:bg-gray-700 focus:outline-none"
                    >
                        {isExpand ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                    </button>
                )}

                {/* <button onClick={toggleNavbar} className="p-2 rounded hover:bg-gray-700 focus:outline-none">
                    {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
                </button> */}
            </div>

            {hasItems && isExpand && isOpen && (
                <ul className="pl-4 mt-2">
                    {items.map((item, index) => (
                        <SideNavBarItem key={index} {...item} />
                    ))}
                </ul>
            )}
        </li>
    );
};

function SideNavBar() {
    const { isOpen, toggleNavbar } = useNavbarStore();

    return (
        <nav
            className={`relative h-[100vh]  p-[1rem] self-stretch content-stretch bg-blue-800  flex-grow-0 transition-all duration-6000 ease-in-out ${
                isOpen ? "w-64" : "w-16"
            }`}
        >
            <ul>
                {navItems.map((item, index) => (
                    <SideNavBarItem key={index} {...item} />
                ))}
            </ul>
        </nav>
    );
}

export default SideNavBar;
