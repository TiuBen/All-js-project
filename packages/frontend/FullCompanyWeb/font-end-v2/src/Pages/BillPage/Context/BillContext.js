import React from "react";
import dayjs from "dayjs";

export const BillContext = React.createContext({
    BillHeader: { title: "", companyName: "鼎道", applyTime: dayjs().format("YYYY-MM-DD") },
    SetBillHeader: () => {},
    SelectedIndex: 0,
    SetSelectedIndex: () => {},
    BillBody: [
        { title: "111", price: 1, count: 111,attachment:{} },
        { title: "222", price: 2, count: 111 ,attachment:{}},
        { title: "333", price: 3, count: 111 ,attachment:{}},
        { title: "444", price: 4, count: 111 ,attachment:{}},
    ],
    SetBillBody: () => {},
});
