import { useState, useContext } from "react";
import HorizontalNav from "./HorizontalNav";
import VerticalNavBar from "./VerticalNavBar";
import { Navigate, Outlet } from "react-router-dom";
import { Modal } from "../Components";

import { ModalContext, UserContext, useLocalStorage } from "../utils/index";

function MainSkeleton({ children }) {
    const { ModalVisibility, SetModalVisibility } = useContext(ModalContext);

    const { user } = useContext(UserContext);

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return (
        <div className="h-full w-full flex flex-1 flex-col bg-white">
            <HorizontalNav />
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "nowrap",
                    flex: "1",
                    // alignItems: "stretch",
                    minHeight: "0",
                }}
            >
                <VerticalNavBar />
                {/* 这里是内容的主要呈现部分,有个阴影和边距效果  */}
                    <Outlet />
                {/* <div className="relative w-full flex flex-col m-[4px] rounded-md overflow-x-hidden shadow-md  shadow-blue-200 ">
                </div> */}
            </div>

            <Modal onClose={() => SetModalVisibility(false)} open={ModalVisibility}>
                <div style={{ width: "200px", height: "200px", border: "1px solid red" }}></div>
            </Modal>
        </div>
    );
}

export { MainSkeleton };
