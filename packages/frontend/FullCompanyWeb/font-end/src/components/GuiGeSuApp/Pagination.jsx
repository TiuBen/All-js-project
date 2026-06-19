import React, { useState, useEffect, useRef } from "react";
import styles from  "./All.module.css";

export default function Pagination() {
    const [currentPage, setCurrentPage] = useState(1);
    const ref = useRef("initialValue");

    useEffect(() => {
        const frame = ref.current;
        console.log(frame);
    }, currentPage);

    return (
        <>

            <div className={styles.paginationContainer} style={{ border: "2px green solid" }}>
                <h2>第{currentPage}页</h2>
                <div className={styles.paginationContentContainer}>
                    <button
                        className={styles.paginationLastButton}
                        onClick={() => {
                            setCurrentPage(currentPage - 1);
                        }}
                    >
                        上一页
                    </button>
                    <iframe ref={ref} className={styles.paginationFrame} src={"http://localhost:3000/guigesu/page" + currentPage}>
                    </iframe>
                    <button
                        className={styles.paginationNextButton}
                        onClick={() => {
                            setCurrentPage(currentPage + 1);
                        }}
                    >
                        下一页
                    </button>
                </div>
            </div>
        </>
    );
}
