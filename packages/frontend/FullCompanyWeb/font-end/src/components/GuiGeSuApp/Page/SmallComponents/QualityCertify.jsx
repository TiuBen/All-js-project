import React from "react";
import styles from "../Page.module.css";

export default function QualityCertify() {
    return (
        <div className={styles.tableContainer + " " + styles.noFlexGrowTableContainer}>
            <table className={styles.borderTable + " " + styles.leftAlignText}>
                <thead>
                    <tr style={{ textAlign: "center" }}>
                        <td colSpan="2" style={{ border: "none", textAlign: "left" }}>
                            <h3>5.PROTECTION(品质保证):</h3>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>5-1.DROP TEST(落体试验)</td>
                   
                        <td>
                            IN MINIMUM PACKAGING CONDITION FAN WITHSTANDS EACH ONE-DROP OF THREE FACES FROM 30 CM
                            DISTANCE HEIGHT ONTO 10 MM THICKNESS OF WOODEN BOARD.
                            <br />
                            (在正常的包装情况下，风扇能够经受将整体包装的三个面分别从 30cm 高度跌落至 10mm
                            厚的木版上，风扇将安然无羕。)
                        </td>
                    </tr>
                    <tr>
                        <td>5-2.LOCKED ROTOR PROTECTION（转子锁定保证）</td>
                    
                        <td>
                            IMPEDANCE OF MOTOR WINDING PROTECTS MOTOR FROM FIRE IN 72 HOURS OF LOCKED ROTOR CONDITION AT
                            THE RATED VOLTAGE.
                        </td>
                    </tr>

                    <tr>
                        <td>5-3.POLARITY PROTECTION(极性保护)</td>
                    
                        <td>
                            BE CAPABLE OF WITHSTANDING IF REVERSE CONNECTION FOR POSITIVE AND NEGATIVE LEADS.
                            <br />
                            (风扇正负极性接反瞬间不会产生危害。){" "}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
