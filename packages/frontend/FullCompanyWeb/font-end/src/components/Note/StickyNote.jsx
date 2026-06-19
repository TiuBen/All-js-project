import React,{useState,useEffect} from "react";
import "./StickyNote.css";

export default function StickyNote() {
    const [notesText, setNotesText] = useState('');




    return (
        <>
            StickyNote
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div >
                    <textarea placeholder="请大家发表意见建议" onChange={(e)=>{
                        setNotesText(e.target.value);
                    }} >{notesText}</textarea>
                    <button onClick={null}>发表</button>
                </div>
                <div>
                    <form>
                        <h3>云文档，请粘贴链接地址</h3>
                        <div>
                            <input type="text" placeholder="文档名"></input>
                            <samp>如果是个人 文件名格式为:“姓名-原名称”</samp>
                        </div>
                        <textarea style={{ width: "100%" }}></textarea>
                        <button style={{ alignSelf: "flex-end" }}>确认上传</button>
                    </form>
                    <form>
                        <h3>如果是本地的文件，请上传，上传前命民格式为"姓名-原名称"</h3>
                        <input
                            type="file"
                            onChange={(e) => {
                                console.log("file :");
                                console.log(e.target.files);
                            }}
                        ></input>
                        <button style={{ alignSelf: "flex-end" }} onClick={(e) => {}}>
                            确认上传
                        </button>
                    </form>
                </div>
                <div>
                    <h2>已有文件汇总</h2>
                    <ul>
                        <li>1</li>
                        <li>1</li>
                        <li>1</li>
                        <li>1</li>
                    </ul>
                </div>
            </div>
        </>
    );
}
