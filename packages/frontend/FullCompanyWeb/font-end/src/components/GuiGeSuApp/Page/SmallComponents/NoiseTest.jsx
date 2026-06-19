import React from "react";
import NoiseTestImg from "./NoiseTestImg";
import styles from "../Page.module.css";

export default function NoiseTest() {
    return (
        <div className={styles.tableContainer}>
            <table className={styles.borderTable}>
                <thead>
                    <tr>
                        <td style={{ border: "none", textAlign: "left" }}>
                            <h2>6.噪音测试</h2>
                        </td>
                    </tr>
                </thead>
                <tr>
                    <td style={{ textAlign: "left" }}>
                        NOISE IS MEASURED AT RATED VOLTAGE IN ANECHOIC(在无响室额定电压下之噪音测试)
                        <br />
                        CHAMBER IN FREE AIR AS BELOW(在空气自由流动的测试室):
                    </td>
                </tr>
                <tr>
                    <td>
                        <NoiseTestImg />
                    </td>
                </tr>
                <tr>
                    <td style={{ textAlign: "left" }}>
                        Noise is measured rated voltage in free air in anechoic chamber with of one meter from the fan intake. The background noise is 18dBA max. B & K Sound level meter with microphone at a distance
                        <br />
                        (在背景噪音不超过18dB(A)的无响室内，将待测风扇通入额定的工作电压，悬掉入空中，将麦克风放于风扇同一平面且离待测风扇进风口一米处进行测试其 B&K 值。)
                    </td>
                </tr>
            </table>
        </div>
    );
}
