import { Outlet } from "react-router-dom";
import { HorizontalNav } from "./Components/HorizontalNav";
import { VerticalNav } from "./Components/VerticalNav";

function Main() {
    return (
        <>
            <HorizontalNav />
            <div id="main" className="flex flex-row flex-grow min-h-0 gap-[0.4rem]  ">
                <VerticalNav />
                <Outlet />
            </div>
            
        </>
    );
}

export default Main;
