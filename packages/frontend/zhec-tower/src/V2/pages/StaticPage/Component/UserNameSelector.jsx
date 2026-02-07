import React, { useState, useEffect } from "react";
import { usernamesRow0, usernamesRow1, usernamesRow2, usernamesRow3 } from "../../../../lib/CONST";
import { Flex, Checkbox, Button, Radio, RadioGroup, Text } from "@radix-ui/themes";
import { ChevronDown } from "lucide-react";

function UserNameSelector(props) {
    const { username,setUsername }= props;
    const [extended, setExtended] = useState(true);

    return (
        <div className="flex flex-col  px-2 gap-2 border text-nowrap">
            <label
                className="font-semibold flex flex-row gap-1"
                onClick={() => {
                    console.log("extended");
                    setExtended(!extended);
                }}
            >
                选择姓名:
                <ChevronDown
                    className={` shrink-0 text-muted-foreground transition-transform duration-200 ${
                        extended ? "rotate-180" : ""
                    } }`}
                />
            </label>
            <div
                className={`flex flex-row flex-wrap gap-1 ${
                    extended ? "" : "hidden"
                } transition-all duration-500 ease-in-out`}
            >
                <RadioGroup.Root
                    className={`flex flex-row flex-wrap gap-1 ${
                        extended ? "" : "hidden"
                    } transition-all duration-500 ease-in-out`}
                    name="username"
                    style={{ flexDirection:"row" }}
                >
                    {[...usernamesRow0,... usernamesRow1,... usernamesRow2, ...usernamesRow3].map((uRow, index) => {
                            return (
                                <Text as="label" size="2" key={index} style={{ minWidth: "4.5rem" }} >
                                    <Flex gap="2">
                                        <RadioGroup.Item
                                            value={uRow}
                                            checked={username === uRow}
                                            onClick={(e) => {
                                                console.log(e.target.value);
                                                setUsername(uRow);
                                            }}
                                        />
                                        {uRow}
                                    </Flex>
                                </Text>
                            );
                   
                    })}
                </RadioGroup.Root>
            
            </div>
        </div>
    );
}

export default UserNameSelector;
