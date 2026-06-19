import React, { useState } from "react";
import useSWR, { SWRConfig } from "swr";
import useSWRMutation from "swr/mutation";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

async function sendRequest(url, { arg }) {
    return fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(arg)
    }).then(res => res.json())
  }
export default function TestService() {
    const [shouldUpdate, setShouldUpdate] = useState(true);

    // const { data,mutate } = useSWR(shouldUpdate ? "http://localhost:3100/api/test" : null, fetcher);

    const { data, mutate } = useSWR("http://localhost:3100/api/test", fetcher);
    const { trigger, isMutating } = useSWRMutation("http://localhost:3100/api/test", sendRequest,);

    // console.log(data);
    return (
        <div style={{ backgroundColor: "#fff100", display: "flex", flexDirection: "column", textAlign: "left" }}>
            <div style={{ border: "1px solid black" }}>
                <h4>get data from server</h4>
                <div>DATA:</div>
                <div>{JSON.stringify(data)}</div>
                <button
                    onClick={() => {
                        mutate();
                    }}
                >
                    Refresh
                </button>
            </div>
            <div style={{ border: "1px solid black" }}>
                <h4>post data to server</h4>
                <label htmlFor="name">Name:</label>
                <input id="name" type="text" value={null} />
                <br />
                <label htmlFor="content">Content:</label>
                <input id="content" type="text" value={null} />
                <br />
                <button
                    onClick={async () => {
                        try {
                            const result = await trigger({ username: 'johndoe' }, /* options */)
                            console.log(result);
                          } catch (e) {
                            // 错误处理
                          }
                    }}
                >
                    Post data to server
                </button>
                <div>ddd</div>
                <div>{JSON.stringify(data)}</div>
            </div>

            <div style={{ border: "1px solid black" }}>
                <h4>auto updated data after post to server</h4>
                <div>DATA:</div>
                <div>{null}</div>
            </div>
        </div>
    );
}
