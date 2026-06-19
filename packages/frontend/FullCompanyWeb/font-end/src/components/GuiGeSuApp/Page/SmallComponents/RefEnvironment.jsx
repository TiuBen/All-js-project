import React from "react";
import styles from "../Page.module.css";

export default function RefEnvironment() {
    return (
        <div className={styles.tableContainer + " " + styles.noFlexGrowTableContainer}>
            <table className={styles.borderTable + " " + styles.leftAlignText}>
                <thead>
                    <tr style={{ textAlign: "center" }}>
                        <td colSpan="2" style={{ border: "none", textAlign: "left" }}>
                            <h3>4.ENVIRONMENTAL(参考环境):</h3>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td> OPERATING TEMPERATURE(运行温度)</td>
                        <td> -10 TO +75 DEGREE C</td>
                    </tr>
                    <tr>
                        <td> STORAGE TEMPERATURE(储存温度)</td>
                        <td>-40 TO +75 DEGREE C</td>
                    </tr>
                    <tr>
                        <td>OPERATING HUMIDITY(运行湿度)</td>
                        <td>5 TO 90% RH</td>
                    </tr>
                    <tr>
                        <td>STORAGE HUMIDITY(储存湿度)</td>
                        <td>5 TO 95% RH</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
