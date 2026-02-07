"use client";
import { fakeNames } from "@/lib/CONST";
import { Heading, RadioGroup } from "@radix-ui/themes";
import { useLocalStorageState } from "ahooks";
export default function TestPrepare() {
    const [username, setUsername] = useLocalStorageState("username", {defaultValue:"",listenStorageChange:true});

    return (
        <div className="w-[200px]">
            <Heading size="4">先选个 名字 测试用</Heading>
            <RadioGroup.Root
                defaultValue={username}
                name="fakeNames"
                onValueChange={(value) => {
                    console.log(value);
                    setUsername(value);
                }}
            >
                {fakeNames.map((name, index) => {
                    return (
                        <RadioGroup.Item key={index} value={name}>
                            {name}{" "}
                        </RadioGroup.Item>
                    );
                })}
            </RadioGroup.Root>
        </div>
    );
}
