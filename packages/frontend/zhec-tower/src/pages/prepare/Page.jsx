import React, { useState, useEffect } from "react";
import TestPrepare from "./TestPrepare";
import { useLocalStorageState } from "ahooks";
import { server, serverActions } from "../../lib/CONST";
import dayjs from "dayjs";
import AfterPrepareDialog from "./AfterPrepareDialog";
import PrepareFrom from "./PrepareFrom";
import UnsuitableUserList from "./UnsuitableUserList";
function Page() {
    const [username, setUsername] = useLocalStorageState("username", { defaultValue: "", listenStorageChange: true });

    const [response, setResponse] = useState("");

    const [open, setOpen] = useState(false);

    const [needReload, setNeedReload] = useState(false);
  

    return (
        <div className="flex flex-col gap-2 p-4">
            <PrepareFrom username={username} setResponse={setResponse} setOpen={setOpen} />
            <AfterPrepareDialog
                open={open}
                setOpen={(value) => setOpen(value)}
                response={response}
                setResponse={setResponse}
                setNeedReload={setNeedReload}
            />
            <UnsuitableUserList needReload={needReload} setNeedReload={setNeedReload}/>
        </div>
    );
}

export { Page };
