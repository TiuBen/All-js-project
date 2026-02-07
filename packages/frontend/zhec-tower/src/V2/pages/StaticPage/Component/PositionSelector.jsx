import React, { useState, useEffect } from "react";
import { Positions } from "../../../../lib/CONST";
import { Flex, Checkbox, Separator, Text } from "@radix-ui/themes";
import { ChevronDown } from "lucide-react";

function PositionSelector(props) {
    const { positions, setPositions } = props;
    const { roleType, setRoleType } = props;
    const [extended, setExtended] = useState(true);

    console.log(positions);
    return (
        <>
            <div className="flex flex-col   px-2 gap-2 border text-nowrap">
                <label
                    className="font-semibold flex flex-row gap-1"
                    onClick={() => {
                        console.log("extended");
                        setExtended(!extended);
                    }}
                >
                    选择席位:
                    <ChevronDown
                        className={` shrink-0 text-muted-foreground transition-transform duration-200 ${
                            extended ? "rotate-180 " : ""
                        } }`}
                    />
                </label>
                <div
                    className={`flex flex-col flex-wrap  gap-2 px-2 ${
                        extended ? "" : "hidden"
                    } transition-all duration-500 ease-in-out bg-slate-200`}
                >
                    <div className="flex flex-row flex-wrap gap-2 ">
                        <label className="font-semibold">席位:</label>
                        {Positions.map((position, index) => {
                            return (
                                <Text
                                    as="label"
                                    className="flex flex-row items-center flex-nowrap flex-none gap-1"
                                    key={index}
                                    gap="1"
                                >
                                    <Checkbox
                                        key={index}
                                        value={position}
                                        checked={positions.includes(position)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setPositions([...positions, position]);
                                            } else {
                                                setPositions(positions.filter((item) => item !== position));
                                            }
                                        }}
                                    />
                                    {position}
                                </Text>
                            );
                        })}
                    </div>
                    <div className="flex flex-row flex-wrap gap-2 items-center">
                        <label className="font-semibold">角色:</label>

                        {["主班", "副班", "教员", "见习", "领班"].map((role, index) => {
                            return (
                                <Text
                                    as="label"
                                    key={index}
                                    className="flex flex-row items-center flex-nowrap flex-none gap-1"
                                    gap="1"
                                >
                                    <Checkbox
                                        value={""}
                                        checked={roleType.includes(role)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setRoleType([...roleType, role ]);
                                            } else {
                                                setRoleType(roleType.filter((item) => item !== role));
                                            }
                                        }}
                                    />
                                    {role}
                                </Text>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}

export default PositionSelector;
