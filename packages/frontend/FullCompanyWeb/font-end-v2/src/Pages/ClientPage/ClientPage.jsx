import React,{useState} from "react";
import { Outlet, Link,useMatches, Routes, Route } from "react-router-dom";
import { DataContextProvider, refToFormData } from "../../utils";
import List from './List'
import Toolbar from './Toolbar'


const Testbusinesscard=()=>{
    return <div>
        Testbusinesscard
    </div>
}

const Testbooks=()=>{
    return <div>
        Testbooks
    </div>
}

const Testinfo=()=>{
    return <div>
        Testinfo
    </div>
}


function ClientPage() {
    const [url,setUrl]=useState('/businesscard')

    return (
        <div className="flex flex-row flex-1 gap-3 m-3">
            <div className="bg-stone-50 w-64 px-4 flex flex-col gap-3 rounded-lg shadow-md self-start">
                <ul className="flex flex-col">
                    <Link  className="hover:underline text-lg font-semibold text-blue-700" to="contact" 
                        // onClick={(e)=>{e.preventDefault();
                        //     window.location.push("ddd")
                        // }}
                        onClick={()=>setUrl("/businesscard")}
                    > 
                        联系人
                    </Link>
                    <Link className="hover:underline text-lg font-semibold text-blue-700" to="product"
                        onClick={()=>setUrl("/books")}
                    
                    >
                        产品目录
                    </Link>
                    <Link className="hover:underline text-lg font-semibold text-blue-700" to="info">
                        资料
                    </Link>
                    <Link className="hover:underline text-lg font-semibold text-blue-700" to="tt1">
                        tt1
                    </Link>
                </ul>
            </div>
            <Routes>
                <Route path="/tt1" element={<Testbusinesscard/>}/>
            </Routes>
            <Outlet />

            {/* <DataContextProvider url={url}>
                <Outlet context={url}/>
            </DataContextProvider> */}
        </div>
    );
}

export default ClientPage;
