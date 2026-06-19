import { createContext, useMemo, useState } from "react";
// function test(){
//     console.log("test");
// }
const FormFactoryContext = createContext({
    formItems: [],
    setFormItems: () => {},
    eventOrder: [],
    setEventOrder: () => {},
    financeOrder: [],
    setFinanceOrder: () => {},
    test: () => {},
});

const FormFactoryProvider = ({ children }) => {
    const [formItems, setFormItems] = useState([]);
    const [eventOrder, setEventOrders] = useState([]);
    const [financeOrder, setFinanceOrder] = useState([]);
    function test(value) {
        console.log("testd" + value);
    }

    // const value = useMemo(
    //     () => ({
    //         formItems,
    //         setFormItems,
    //         eventOrder,
    //         setEventOrders,
    //         financeOrder,
    //         setFinanceOrder,
    //         test,
    //     }),
    //     []
    // );

    return (
        <FormFactoryContext.Provider value={{ formItems, setFormItems, test }}>{children}</FormFactoryContext.Provider>
    );
};

export { FormFactoryContext, FormFactoryProvider };
