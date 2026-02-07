import { Button, Flex, Checkbox, CheckboxGroup, Text, TextField, Radio, RadioGroup } from "@radix-ui/themes";
import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { usePage, SERVER_URL, FETCHER } from "@utils";
import { API_URL } from "@utils/const/Const";

function PositionListItem(props) {
    const {
        title,
        isTitleRadio,
        isCoDuty,
        isTeacher,
        itemType = "checkbox",
        dutyButtonType,
        name,
        onClick,
        canTeach,
        onTitleClick,
    } = props;
    return (
        <div
            className="flex flex-col gap-1 justify-start  border border-gray-200 bg-gray-100 px-[0.5rem] py-1 rounded"
            onClick={onClick}
        >
            <label  className="inline-flex gap-1 items-center">
                <input
                    type={itemType ?? "checkbox"}
                    name={name}
                    value={title}
                    onChange={(e) => {
                        console.log(e.target.value);
                        console.log(title);
                    }}
                />
                {title}
            </label>
            {isCoDuty && (
                <div
                    className="flex flex-col border border-gray-200 px-[0.2rem] rounded"
                    // onChange={(e) => {
                    //     e.stopPropagation();
                    //     console.log(e.target.value);
                    // }}
                >
                    {["主班", "副班"].map((x, i) => {
                        return (
                            <label key={i} className="inline-flex gap-1">
                                <input type={dutyButtonType} value={x} name={`${i}isMainOrCo`} />
                                {x}
                            </label>
                        );
                    })}
                </div>
            )}
            {canTeach === 1 ? (
                <div className="flex flex-col border border-gray-200 px-[0.2rem] rounded">
                    {["教员", "见习"].map((y, i) => {
                        return (
                            <label key={i} className="inline-flex gap-1">
                                <input type="radio" name="isTeacherOrStudent" value={y} key={i} />
                                {y}
                            </label>
                        );
                    })}
                </div>
            ) : (
                <> </>
            )}
        </div>
    );
}

function PositionList(props) {
    const { title, isTitleRadio, isCoDuty, isTeacher, itemType } = props;
    const { data: positions } = useSWR(API_URL.query_positions, FETCHER);

    console.log(positions);
    return (
        <div className="flex flex-row gap-2">
            {positions &&
                positions.map((x, i) => {
                    return (
                        <PositionListItem
                            key={i}
                            title={x.position}
                            
                            itemType={itemType || "radio"}
                            name="position"
                            isCoDuty={x.dutyType === "主班,副班"}
                            dutyButtonType={x.dutyType === "主班,副班" ? "checkbox" : "radio"}
                            canTeach={x.canTeach}
                        />
                    );
                })}
        </div>
    );
}

export default PositionList;
