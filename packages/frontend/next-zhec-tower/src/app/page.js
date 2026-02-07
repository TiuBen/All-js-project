"use client";

import { useEffect, useState } from "react";
import { server, serverActions } from "@/lib/CONST";
import { OnDutyPosition } from "@/components/OnDutyCell";
import { useLocalStorageState } from "ahooks";

export default function Home() {
    const [peopleOnDuty, setPeopleOnDuty] = useState({});

    const [position, setPosition] = useLocalStorageState("position", { defaultValue: "西塔台", listenStorageChange: true });

    

    return (
        <main className="flex flex-col items-start gap-4 ">
            <section className="flex flex-col items-center  border rounded-lg">
                <h2 className="font-black text-xl">西侧</h2>
                <div className="flex-1 w-full flex flex-row ">
                    <OnDutyPosition
                        position="西塔台"
                        needTwoPeople={true}
                        onSelect={() => {
                            setPosition("西塔台");
                        }}
                    />
                    <OnDutyPosition
                        position="西地面"
                        needTwoPeople={true}
                        onSelect={() => {
                            setPosition("西地面");
                        }}
                    />
                    <OnDutyPosition
                        position="西放行"
                        needTwoPeople={true}
                        onSelect={() => {
                            setPosition("西放行");
                        }}
                    />
                </div>
            </section>

            <section className="flex flex-col items-center border rounded-lg">
                <h2 className="font-black text-xl">中间</h2>
                <div className="flex-1 w-full flex flex-row">
                    <OnDutyPosition
                        position="领班"
                        onSelect={() => {
                            setPosition("领班");
                        }}
                    />
                    <OnDutyPosition
                        position="流控"
                        onSelect={() => {
                            setPosition("流控");
                        }}
                    />
                </div>
            </section>
            <section className="flex flex-col items-center border rounded-lg">
                <h2 className="font-black text-xl">东侧</h2>
                <div className="flex-1 w-full flex flex-row">
                    <OnDutyPosition
                        position="东塔台"
                        needTwoPeople={true}
                        onSelect={() => {
                            setPosition("东塔台");
                        }}
                    />
                    <OnDutyPosition
                        position="东地面"
                        needTwoPeople={true}
                        onSelect={() => {
                            setPosition("东地面");
                        }}
                    />
                    <OnDutyPosition
                        position="东放行"
                        needTwoPeople={true}
                        onSelect={() => {
                            setPosition("东放行");
                        }}
                    />
                </div>
            </section>
        </main>
    );
}
