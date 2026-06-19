import React from "react";
import styles from "./Page.module.css";

export default function Page2() {
    return (
        <div className={ styles.flexContainer }>
            <div className={styles.tableContainer +" "+styles.noFlexGrowTableContainer +" "+styles.secondPage}>
                <table className={styles.borderTable}>
                    <tr className="" role="SCOPE">
                        <td colSpan="2" style={{border:'none' , textAlign: "left" }}>
                            <h3>1. SCOPE(范围):</h3>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2" style={{ color: "red" }}>
                            THIS SPECIFICATION DEFINES THE ELECTRICAL AND MECHANICAL CHARACTERISTICS OF THE DC BRUSHLESS
                            AXIAL FLOW FAN.THE FAN MOTOR IS WITH TWO PHASES AND FOUR POLES.
                            (本承认书定义了轴流式直流无刷风扇的电气特性和机械特性。此风扇马达为两相四极式。)
                        </td>
                    </tr>
                </table>
            </div>
            <div className={styles.tableContainer+" "}>
                <table className={styles.borderTable+" "+styles.leftAlignText}>
                    <thead>
                        <tr>
                            <td colSpan="2" style={{border:'none' , textAlign: "left" }}>
                                <h3>2. ELECTRICAL(电气特性):</h3>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ textAlign: "center" }}>ITEM</td>
                            <td style={{ textAlign: "center", fontWeight: "normal" }}> DESCRIPTION</td>
                        </tr>
                        <tr>
                            <td>RATED VOLTAGE(额定电压) </td>
                            <td className="value-text">24 VDC</td>
                        </tr>
                        <tr>
                            <td>OPERATION VOLTAGE(允许电压)</td>
                            <td>12~13.2VDC</td>
                        </tr>
                        <tr>
                            <td>
                                START VOLTAGE(启动电压) (ENVIRONMENT TEMPERATURE AT -10°C TO +55°C) (环境温度
                                -10°C—+55°C)
                            </td>
                            <td>≦12VDC</td>
                        </tr>
                        <tr>
                            <td>RATED CURRENT(额定电流)</td>
                            <td> ≦0.4A </td>
                        </tr>
                        <tr>
                            <td>INPUT POWER(输入功率)</td>
                            <td> ≦4.8W</td>
                        </tr>
                        <tr>
                            <td> SPEED(转速)</td>
                            <td> 6300rpm+10%</td>
                        </tr>
                        <tr>
                            <td> MAX.AIR FLOW(最大风量) (AT ZERO STATIC PRESSURE)</td>
                            <td>83.27CFM min:75 CFM</td>
                        </tr>
                        <tr>
                            <td>MAX.AIR PRESSURE(最大风压) (AT ZEROAIRFLOW)</td>
                            <td>21.21mmAq min:17.6 mmAq</td>
                        </tr>
                        <tr>
                            <td>ACOUSTICAL NOISE (AVG.) (平均噪音)</td>
                            <td>52 dB(A) max:55.6 dB(A)</td>
                        </tr>
                        <tr>
                            <td>INSULATION STRENGTH(绝缘强度)</td>
                            <td>
                                10 MEG OHM MIN. AT 500 VDC (BETWEEN FRAME AND (+) TERMINAL)
                                (在通入500伏直流电压条件下，外框与端子线间阻抗不 低于 10 兆欧)
                            </td>
                        </tr>
                        <tr>
                            <td>DIELECTRIC STRENGTH(介质强度)</td>
                            <td>
                                5 mA MAX. AT 500 VAC 60Hz ONE MINUTE. (BETWEEN FRAME AND (+) TERMINAL) (在通入 500V/60Hz
                                交流电一分钟条件下，外框与端子线间电流不超过 5mA)
                            </td>
                        </tr>
                        <tr>
                            <td>LIFE EXPECTANCY(预期寿命)</td>
                            <td>
                                70,000 HOURS CONTINUOUS OPERATION AT 25 °C WITH 15~65 %RH(在环境温度为
                                25°C，相对湿度为15~65 %RH 的条件下 预期能正常工作 70，000 小时)
                            </td>
                        </tr>
                        <tr>
                            <td> ROTATION(转动模式)</td>
                            <td>CLOCKWISE VIEW FROM NAME PLATE SIDE(从框边视 向为逆时针旋转)</td>
                        </tr>
                        <tr>
                            <td>IP GRADE/IP(等级)</td>
                            <td>IP54</td>
                        </tr>
                        <tr>
                            <td>LEAD WIRE（线材）</td>
                            <td>
                                UL两线2.0端子 1007#28AWG 线长85MM 红、黑
                                <br />
                                RED WIRE POSITIVE (+)
                                <br />
                                BLACK WIRE NEGATIVE (-)
                                <br />
                            </td>
                        </tr>
                        <tr>
                            <td>不平衡量</td>
                            <td>≦10MG</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
