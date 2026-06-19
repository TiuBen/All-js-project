import React from "react";
import styles from "../Page.module.css";

export default function PartMaterial() {
    return (
        <div className={styles.tableContainer + " " + styles.noFlexGrowTableContainer}>
            <table className={styles.borderTable + " " + styles.leftAlignText}>
                <thead>
                    <tr style={{ textAlign: "center" }}>
                        <td colSpan="2" style={{ border: "none", textAlign: "left" }}>
                            <h3>3. MECHANICAL(部件材质):</h3>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>DIMENSIONS(尺寸) </td>
                        <td>SEE DIMENSIONS DRAWING(60*60*25MM) </td>
                    </tr>
                    <tr>
                        <td>FRAME(框)</td>
                        <td> 6025 BLACK (黑色 PBT 料外框)</td>
                    </tr>
                    <tr>
                        <td> IMPELLER(扇叶)</td>
                        <td>6025 BLACK (黑色 PBT 料扇叶)</td>
                    </tr>
                    <tr>
                        <td> BEARING SYSTEM(轴承类别)</td>
                        <td> TWO BALL BEARING(双滚珠轴承)</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
