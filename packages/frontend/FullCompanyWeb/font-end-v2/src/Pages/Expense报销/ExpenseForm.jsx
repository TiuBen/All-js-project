import dayjs from "dayjs";
import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Request, useUser } from "../../utils/index";

const ExpenseForm = () => {
    // const { aaa, changeRelateTab } = useOutletContext();
    // // * 这里修改关联的Tab为了匹配路由
    // useEffect(() => {
    //     // * 这个页面是tab index= 0
    //     console.log("* 这个页面是tab index= 0");
    //     changeRelateTab(0);
    // }, []);

    // console.log(aaa);

    const { user } = useUser();
    const [expensePerson, setExpensePerson] = useState(user);
    const [expenseReason, setExpenseReason] = useState("");
    const [expenseDate, setExpenseDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [attachment, setAttachment] = useState(null);
    const navigateTo = useNavigate({ relative: true });

    const handleSubmit = (event) => {
        event.preventDefault();
        // Process the form data here or send it to the backend
        const formData = new FormData();
        formData.append("expensePerson", expensePerson);
        formData.append("expenseReason", expenseReason);
        formData.append("expenseDate", expenseDate);
        // formData.append("attachment", attachment);
        if (attachment) {
            for (let index = 0; index < attachment.length; index++) {
                formData.append("attachment", attachment[index], attachment[index].name);
            }
        }

        console.log({
            expensePerson,
            expenseReason,
            expenseDate,
            attachment,
        });
        setExpenseReason("");
        setExpenseDate(dayjs().format("YYYY-MM-DD"));
        setAttachment(null);
        // console.log(formData);
        Request.post("/form?name=expense", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }).then((res) => {
            console.log(res);
            navigateTo("..");
        });
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto self-center p-4 bg-white shadow-md rounded-md">
                <div className="mb-4">
                    <label htmlFor="expensePerson" className="block text-gray-700 font-semibold mb-1">
                        报销人
                    </label>
                    <input
                        type="text"
                        id="expensePerson"
                        value={expensePerson ?? user}
                        disabled={true}
                        onChange={(e) => setExpensePerson(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="expenseReason" className="block text-gray-700 font-semibold mb-1">
                        报销事由
                    </label>
                    <input
                        type="text"
                        id="expenseReason"
                        value={expenseReason}
                        onChange={(e) => setExpenseReason(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="expenseDate" className="block text-gray-700 font-semibold mb-1">
                        花费产生时间
                    </label>
                    <input
                        type="date"
                        id="expenseDate"
                        value={expenseDate}
                        onChange={(e) => setExpenseDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="attachment" className="block text-gray-700 font-semibold mb-1">
                        附件
                    </label>
                    <input
                        type="file"
                        id="attachment"
                        multiple={true}
                        onChange={(e) => setAttachment(e.target.files)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md">
                    提交
                </button>
            </form>
        </>
    );
};

export default ExpenseForm;
