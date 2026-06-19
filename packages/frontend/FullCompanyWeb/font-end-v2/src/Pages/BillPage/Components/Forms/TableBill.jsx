import { useEffect, useState } from "react";

function TableBill() {
    const [dataSource, setDataSource] = useState([]);
    useEffect(() => {
        fetch("http://localhost:3001/mock/bills.json")
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setDataSource(data);
            });
    }, []);

    if (!dataSource) {
        return <h1>...Loading</h1>;
    }

    return (
        <div className="overflow-x-auto px-2 flex-1  bg-white m-1 border border-dark-subtle rounded shadow-xl">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-base font-semibold text-gray-700 uppercase bg-gray-50 p-2 m-2">
                    <tr>
                        <th>序号</th>
                        <th>报销人</th>
                        <th>申请时间</th>
                        <th>内容</th>
                        <th>金额</th>
                        <th>附件</th>
                        <th>状态</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    {dataSource.map((row, index) => {
                        return (
                            <tr className="border-b" key={index}>
                                <td>{row?.id}</td>
                                <td>{row?.creator}</td>
                                <td>{row?.applyTime}</td>
                                <td>{row?.title}</td>
                                <td>{row?.sumAmount}</td>
                                <td>{row?.attachment}</td>
                                <td>{row?.status}</td>
                                <td>
                                    <p class=" text-gray-500 dark:text-gray-400">
                                        <a
                                            href="#"
                                            class="inline-flex items-center font-medium text-blue-600 hover:underline"
                                        >
                                            查看
                                            <span class="material-icons-outlined text-sm">arrow_forward</span>
                                        </a>
                                    </p>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export {TableBill};
