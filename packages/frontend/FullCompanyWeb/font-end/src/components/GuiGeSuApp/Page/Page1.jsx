import React from "react";
import styles from "./Page.module.css";
import DDJWloge from "../public/DDJW鼎道晶威公司logo.png";

export default function Page1() {
    return (
        <div className={styles.flexContainer}>
            <div className={styles.logoNameHeader}>
                <img class={styles.logo + " " + styles.DDJW} src={DDJWloge} alt="DDJW" height="80" width="80"></img>
                <div>
                    <h1 style={{ margin: "0.25rem" }}>深圳市鼎道晶威科技有限公司</h1>
                    <h1 style={{ margin: "0.25rem" }}>Shenzhen DDJW Technology Co. Ltd</h1>
                </div>
            </div>
            <div className={styles.tableContainer}>
                <table className={styles.borderTable}>
                    <thead>
                        <tr style={{ textAlign: "center" }}>
                            <td colSpan="2" style={{ fontWeight: "500" }}>
                                <h2>样品承认书</h2>
                            </td>
                        </tr>
                    </thead>
                    <tr>
                        <td>客户名称:</td>
                        <td className={styles.valueCellText}>XXXXXXXX</td>
                    </tr>
                    <tr>
                        <td>产品料号:</td>
                        <td className={styles.valueCellText}>XXXXXXXX</td>
                    </tr>
                    <tr>
                        <td>规格型号:</td>
                        <td className={styles.valueCellText}>
                            XXXXXXXX
                            <span> 以实际送样标签为准 </span>
                        </td>
                    </tr>
                    <tr>
                        <td>客户料号:</td>
                        <td className={styles.valueCellText}>XXXXXXXX</td>
                    </tr>
                    <tr>
                        <td>送样日期:</td>
                        <td className={styles.valueCellText}>XXXXXXXX</td>
                    </tr>
                    <tr>
                        <td>送样数量:</td>
                        <td className={styles.valueCellText}>XXXXXXXX</td>
                    </tr>
                    <tr>
                        <td>版本号码:</td>
                        <td className={styles.valueCellText}>XXXXXXXX</td>
                    </tr>
                </table>
            </div>
            <div className={styles.tableContainer}>
                <table className={styles.borderTable}>
                    <tr>
                        <td colSpan="4">
                            <h4>厂商确认栏</h4>
                        </td>
                    </tr>
                    <tr>
                        <td>承认章</td>
                        <td>测试</td>
                        <td>审核</td>
                        <td>核准</td>
                    </tr>
                    <tr>
                        <td>XXXXXXXX</td>
                        <td className={styles.signText}>刘广慧</td>
                        <td className={styles.signText}>刘海</td>
                        <td className={styles.signText}>吴莉</td>
                    </tr>
                </table>
            </div>
            <div className={styles.tableContainer}>
                <table className={styles.borderTable}>
                    <tr>
                        <td colSpan="4">
                            <h4>客户承认栏</h4>
                        </td>
                    </tr>

                    <tr>
                        <td>承认章</td>
                        <td>测试</td>
                        <td>审核</td>
                        <td>核准</td>
                    </tr>
                    <tr>
                        <td> XXXXXXXX </td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </table>
            </div>
            <div className={styles.tableContainer}>
                <table className={styles.borderTable}>
                    <tr>
                        <td>公司地址</td>
                        <td colSpan="3" className={styles.valueCellText}>
                            深圳市南山区科技园科发路长城电脑大厦2号楼
                        </td>
                    </tr>
                    <tr>
                        <td>深圳厂址</td>
                        <td colSpan="3" className={styles.valueCellText}>
                            深圳市观澜街道大水田工业区
                        </td>
                    </tr>
                    <tr>
                        <td>东莞厂址</td>
                        <td colSpan="3" className={styles.valueCellText}>
                            深圳市宝安区观澜街道大水田工业区
                        </td>
                    </tr>
                    <tr>
                        <td> 电 话: </td>
                        <td className={styles.valueCellText}>0755-2658 5060</td>
                        <td> 传 真: </td>
                        <td className={styles.valueCellText}> 0755-2658 5060-106 </td>
                    </tr>
                    <tr>
                        <td> 邮 箱: </td>
                        <td className={styles.valueCellText}>lilywu_18@kcv.net.cn</td>
                        <td> 网 址: </td>
                        <td className={styles.valueCellText}> www.kcv.net.cn </td>
                    </tr>
                </table>
            </div>
        </div>
    );
}
