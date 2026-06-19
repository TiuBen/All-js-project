import React from "react";
import styles from  "./All.module.css";

export default function EditPage() {
    return (
        <div className={styles.editPage} style={{height:'99vh'}}>
            EditPage
            <div style={{ border: "1px solid green", margin: "4px" }}>
                <div className="flex-row">
                    <h1>用什么公司</h1>
                    <select name="cars" id="cars">
                        <option value="1"> 深圳市鼎道晶威科技有限公司</option>
                        <option value="2"> 安文 </option>
                    </select>
                </div>
                <div className="flex-row">
                    <label for="">客户名称</label>
                    <input id=""></input>
                </div>
                <div className="flex-row">
                    <label for="">产品料号</label>
                    <input id=""></input>
                </div>
                <div className="flex-row">
                    <label for="">规格型号：（勿直接填写，系统会自动生成） </label>
                    <input id=""></input>
                </div>
                <div className="flex-row">
                    <label for="">送样时间：（勿直接填写，系统会自动生成） </label>
                    <input id="" type="date"></input>
                </div>
                <div className="flex-row">
                    <label for="">送样数量：（注意做好登记（应该后台是自动录入的）） </label>
                    <input id=""></input>
                </div>
            </div>
            <div style={{ border: "1px solid green", margin: "4px" }}>
                <div className="flex-row">
                    <label for="">额定电压</label>
                    <input id=""></input>
                </div>
            </div>
        </div>
    );
}

/* <div className="flex-row">
    <label for="">客户名称</label>
    <input id=""></input>
</div>; */
