import { Button, Dialog } from "@radix-ui/themes";
import React, { useState, useEffect, useContext, createContext, useRef } from "react";
import { usePage } from "@utils";
import EditDutyRecord from "../Page2/SheetPage/LikeExcel/EditDutyRecord";

function EditPositionDialog() {
    const { payload, setPayload } = usePage();
    const { editSheetDisplay } = payload;
    return (
        <Dialog.Root
            open={editSheetDisplay}
            onOpenChange={() => {
                setPayload((prev) => {
                    return { ...prev, editSheetDisplay: false };
                });
            }}
        >
            <Dialog.Content maxWidth="1000px" className=" border border-red-600 flex flex-col gap-2 overflow-y-auto">
                <Dialog.Title className="flex flex-row justify-between text-wrap">
                    <div>修改执勤记录</div>
                    <Button
                        color="red"
                        onClick={() => {
                            setPayload((prev) => {
                                return { ...prev, editSheetDisplay: false };
                            });
                        }}
                    >
                        X
                    </Button>
                </Dialog.Title>
                <Dialog.Description>
                    此功能仅能修改执勤记录,如果此条目具备教员资格,请先检查或修改学员记录。
                </Dialog.Description>
                <EditDutyRecord />
            </Dialog.Content>
        </Dialog.Root>
    );
}

export default EditPositionDialog;
