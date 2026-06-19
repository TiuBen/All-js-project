import React from "react";
import styles from "../Page.module.css";

export default function Notes() {
    return (
        <div className={styles.tableContainer } style={{ flexGrow: 0}}>
            <table className={styles.borderTable} style={{ border: "none", textAlign: "left" }}>
                <thead>
                    <tr>
                        <td style={{ border: "none", textAlign: "left" }}>
                            <h2>8. NOTES(注意事项)</h2>
                        </td>
                    </tr>
                </thead>

                <tr>
                    <td>
                        8.1 Please do not touch the impeller and never carry the fan the lead wires. The bearings and
                        the lead wires may be damaged. <br />
                        (请不要碰触扇叶和拉扯线材，以免损坏轴承及导线。)
                    </td>
                </tr>
                <tr>
                    <td>
                        8.2 For the purpose of MIS, please specify the Model No. on every order. <br />
                        (便于订单管理,请在每一订单上详细注明其型号.)
                    </td>
                </tr>
                <tr>
                    <td>
                        8.3 Please do not use the fan in the environment of corrosive gas or liquid. <br />
                        (请不要将风扇置于腐蚀的气体和液体内.)
                    </td>
                </tr>
                <tr>
                    <td>
                        8.4 Please do not store the fan in the environment of high humidity. Please avoid storage of the
                        fan over 6 months . For long term storage, please connect power to the fan shortly every 6
                        months even through the fan is stored in room temperature. <br />
                        (请不要将风扇储存在高湿度的环境中，请尽量避免将风扇储存期超过
                        6个月。如果要长期储存，请将其在室温的环境下， 且每隔 6 个月须通上电源让风扇短时间运转。)
                    </td>
                </tr>
                <tr>
                    <td>
                        8.5 While the fan is in operation, please do not lock the fan intentionally for a long period of
                        time to prevent over heating which may cause permanent <br />
                        damage.(当风扇在正常运转时，请不要长时间故意地锁定风扇，那样会使风扇过热从而有可能导致风扇的永久性损坏。)
                    </td>
                </tr>
            </table>
        </div>
    );
}
