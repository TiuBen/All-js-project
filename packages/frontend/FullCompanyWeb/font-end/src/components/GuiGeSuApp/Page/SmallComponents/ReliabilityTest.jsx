import React from "react";
import styles from "../Page.module.css";

export default function ReliabilityTest() {
    return (
        <div className={styles.tableContainer}>
            <table className={styles.borderTable + " " + styles.reliabilityTable}>
                <thead>
                    <tr>
                        <td style={{ border: "none", textAlign: "left" }}>
                            <h2>7.RELIABILITY(可靠度测试):</h2>
                        </td>
                    </tr>
                </thead>
                <tbody className={styles.testTbody}>
                    <tr style={{ border: "none", textAlign: "left" }}>
                        <td>7-1. HUMIDITY EXPOSURE (耐湿测试)</td>
                    </tr>
                    <tr>
                        <td>
                            TEMPERATURE(温度): +25°C ~ +65°C<br/>
                            HUMIDITY(湿度): 90-98% RH @ +65°C<br/>
                            FOR 4 HOURS/CYCLE(4 小时为一测试周期)<br/>
                            POWER(通电状况): NON-OPERATING(无通电)<br/>
                            TEST TIME(测试时间): 168 HOURS(小时)<br/>
                        </td>
                    </tr>
                    <tr>
                        <td>7-2. VIBRATION (振动测试)</td>
                    </tr>
                    <tr>
                        <td>
                            TEMPERATURE(温度): +25°C<br/>
                            ORIENTATION(方向): X, Y, Z<br/>
                            POWER(通电状况): NON-OPERATING(无通电) <br/>
                            VIBRATION LEVEL(振动标准): OVERALL gRMS=3.2<br/>
                        </td>
                    </tr>
                    <tr>
                        <td>7-3. MECHANICAL SHOCK (机械震动测试)</td>
                    </tr>
                    <tr>
                        <td>
                                TEMPERATURE: +20°C(温度: +20°C)<br/>
                                ORIENTATION: X, Y, Z(方向: X, Y, Z)<br/>
                                POWER: NON-OPERATING(通电状况: 无通电)<br/>
                                ACCELERATION: 20 G MIN(加速度: 20 倍重力加速度)<br/>
                                PULSE: 11 ms HALF-SINE WAVE(脉冲: 周期为 11 ms 的半波)<br/>
                                NUMBER OF SHOCKS: 5 SHOCKS<br/>
                                FOR EACH DIRECTION<br/>
                                (震动次数:每方向震动 5 次)<br/>
                        </td>
                    </tr>
                    <tr>
                        <td>7-4. LIFE (寿命测试) </td>
                    </tr>
                    <tr>
                        <td>
                                TEMPERATURE: +80°C(温度: +80°C)<br/>
                                POWER: OPERATING(通电状况: 通电)<br/>
                                DURATION: 1000 HOURS MIN(为期时间: 最小 1000 小时)<br/>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
