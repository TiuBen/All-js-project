import React from "react";
import styles from "./All.module.css";
import ModulePage from "./ModulePage";
import EditPage from "./EditPage";
import Pagination from "./Pagination";

export default function MainPage() {
    return (
        <>
            <a href="http://192.168.0.178:3000" style={{position:'absolute',top:'0px'}}>回到主页</a>
            <div className={styles.mainPage}>
                <ModulePage />
                <EditPage />
                <Pagination />
            </div>
        </>
    );
}
