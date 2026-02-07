import { useEffect, useState } from "react";
// import { server, serverActions } from "@/lib/CONST";
import OnDutyPosition from "./OnDutyPosition";

export default function Main() {
    return (
        <main className="flex flex-row flex-wrap flex-1 items-start my-auto mx-[4rem] gap-4 ">
            <OnDutyPosition position="西塔台" needTwoPeople={true} />
            <OnDutyPosition position="西地面" needTwoPeople={true} />
            <OnDutyPosition position="西放行" needTwoPeople={true} />
            <OnDutyPosition position="进近高扇" needTwoPeople={true} />
            <OnDutyPosition position="进近低扇" needTwoPeople={true} />
            <OnDutyPosition position="东塔台" needTwoPeople={true} />
            <OnDutyPosition position="东地面" needTwoPeople={true} />
            <OnDutyPosition position="东放行" needTwoPeople={true} />
            <OnDutyPosition position="领班" />
            <OnDutyPosition position="流控" />
            {/* <section className="flex flex-col items-center  border rounded-lg ">
                <h2 className="font-black text-xl ">西侧</h2>
                <div className="items-start  flex flex-row flex-wrap gap-2  ">
                
                </div>
            </section> */}
            {/* <section className="flex flex-col items-center  border rounded-lg">
                <h2 className="font-black text-xl">进近</h2>
                <div className="items-start  flex flex-row flex-wrap gap-2  ">
                
                </div>
            </section>

            <section className="flex flex-col items-center  border rounded-lg">
                <h2 className="font-black text-xl">中间</h2>
                <div className="items-start  flex flex-row flex-wrap gap-2  ">
                  
                </div>
            </section>
            <section className="flex flex-col items-center  border rounded-lg">
                <h2 className="font-black text-xl">东侧</h2>
                <div className="items-start  flex flex-row flex-wrap gap-2  ">
                  
                </div>
            </section> */}
        </main>
    );
}
