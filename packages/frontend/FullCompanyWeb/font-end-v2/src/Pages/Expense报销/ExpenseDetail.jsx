import React, { useEffect } from "react";
import "./Expense.scss";
const ExpenseFlow = [
    { time: "2023年4月20号", title: "提交报销", state: "" },
    { time: "2023年4月24号", title: "本人确认报销", state: "" },
    { time: "2023年4月24号", title: "报销证明人确认", state: "" },
    { time: "2023年4月24号", title: "财务确认", state: "" },
    { time: "2023年4月25号", title: "财务转账", state: "" },
    { time: "2023年4月28号", title: "报销人确认收到", state: "" },
    { time: "2023年4月28号", title: "主管确认完成此次报销", state: "" },
    { time: "2023年4月28号", title: "生成PDF上传到服务器", state: "" },
];

function TimelineItem({ time, title, state }) {
    return (
        <li className="TimelineItem">
            <div class="TimelineItem-badge"></div>
            <div className="TimelineItem-body">
                <div class="timeline-date">{time}</div>
                <div class="timeline-content">{title}</div>
            </div>
        </li>
    );
}

function ExpenseDetail() {
    useEffect(() => {
        // Request.get("/form").then((data) => setAllExpenseItems(data));
    }, []);

    return (
        <>
            <div className="flex flex-col justify-between w-2/3 h-full">
                <article className="flex flex-col">
                    <h3 className="text-xl mb-4 inline-block">韩晶威公司</h3>

                    <h2 className="text-2xl font-bold mb-4 inline-block">
                        {" "}
                        <em>员工</em>:吴迪
                    </h2>
                    <span className="text-xl">2023年12月23日 因 出差 产生费用 2023元 </span>

                    <div>
                        报销证明人<span>沈宁</span>
                        <span>同事</span>
                    </div>
                    <div>
                        费用文件
                        <img src></img>
                    </div>
                    <div>
                        发票文件
                        <img src></img>
                    </div>
                </article>
                <div className="border ">
                    编辑框
                    <div>签名栏</div>
                    <div>返回上一流程 </div>
                    <div>进入下一流程 </div>
                    <textarea>意见</textarea>
                </div>
            </div>

            <aside className=" w-1/3 bg-slate-200">
                <div class="Timeline py-2">
                    {ExpenseFlow.map((item, index) => {
                        return <TimelineItem key={index} time={item.time} title={item.title} state={item.state} />;
                    })}
                </div>
                <div>
                    <ul className="text-sm">
                        <li className=" text-teal-500">绿色表示已经完成</li>
                        <li className="text-sky-500	">蓝色表示正常处理</li>
                        <li className="text-stone-400	 ">灰色表示未进行</li>
                        <li className="text-red-600	">红色表示出现问题</li>
                    </ul>
                </div>
            </aside>
        </>
    );
}

export default ExpenseDetail;
