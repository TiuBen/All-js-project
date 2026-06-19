import { useState } from "react";
import useSWR, { SWRConfig } from "swr";
import useSWRMutation from "swr/mutation";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

async function sendRequest(url,  arg ) {
    return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:JSON.stringify(arg),
    }).then((res) => res.json());
}

const testJsData={
    "name": "先团平状温需规处造确万小三。",
    "address": "西南上海白山市米林县",
    "category": "许,例,适,风",
    "detail": "图对做工开说又从斯行通区反头观。使达道长小比变运统七五较准。行般文运酸米万我风流而管么斯识间先验。车展响布断革议表起么化前。百明石往反五水集示少间全治包开意。三相几发个第事习得置新品经情些究特构。每可写或般见近每非日清民般物。",
    "staff": [
        {
            "name": "余桂英",
            "contact": [
                {
                    "type": "电话",
                    "content": "375248160911034061"
                }
            ]
        }
    ]
};



function TestConnectBackend() {
    const [content, setContent] = useState({});

    const { data, mutate } = useSWR("http://localhost:3100/api/test", fetcher);
    const { trigger, isMutating } = useSWRMutation("http://localhost:3100/api/test", sendRequest);

    return (
        <div>
            <h2> TestConnectBackend</h2>
            <button className="btn btn-outline-primary" onClick={(e) => {
                fetch("http://localhost:3100/v2/test",{ method: "GET"})


            }}>
                测试连接服务器
            </button>
            <button className="btn btn-outline-primary" onClick={e=>{
                sendRequest("http://localhost:3100/v2/test",testJsData).then(d=>{setContent(d)})

                setContent(trigger)
            }}>测试保存JSON到服务器</button>
            <button className="btn btn-outline-primary">测试读取JSON</button>
            <div className="border">{JSON.stringify(content)}</div>
        </div>
    );
}

export default TestConnectBackend;
