import React from "react";
import { PanelRightOpen, PanelLeftOpen } from "lucide-react";
import useNavbarStore from "../store/navbarStore";

function HorizontalNavBar() {
    const { isOpen, toggleNavbar } = useNavbarStore();

    return (
        <div className="flex flex-1 w-full flex-row h-[3rem] items-center bg-gray-100 ">
            <button onClick={toggleNavbar} className="p-2 rounded focus:outline-none">
                {isOpen ? <PanelRightOpen size={18} /> : <PanelLeftOpen size={18} />}
            </button>
        </div>
    );
}

export default HorizontalNavBar;
