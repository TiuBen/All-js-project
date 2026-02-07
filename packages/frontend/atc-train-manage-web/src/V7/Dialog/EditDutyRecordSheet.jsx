import React from "react";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

import { Button, Dialog } from "@radix-ui/themes";

import { usePage } from "@utils";
import EditDutyRecord from "../Page2/SheetPage/LikeExcel/EditDutyRecord";
import useDialog from "../../utils/hooks/useDialog";

function EditDutyRecordSheet() {
    const { dialogPayload,setDialogPayload } = useDialog();
    // const { data: positions, error, isLoading } = useSWR(API_URL.query_positions, FETCHER);
    // const { data: roles } = useSWR(API_URL.query_roles, FETCHER);

    return (
        <Dialog.Root
            open={dialogPayload.editSheetDisplay}
            // onOpenChange={() => {
            //     setDialogPayload((prev) => {
            //         return { ...prev, editSheetDisplay: false };
            //     });
            // }}
        >
            <Dialog.Content className=" min-w-[60%] flex flex-col  overflow-y-auto font-mono font-serif">
                <Dialog.Title className="flex flex-row justify-between ">
                    <div>修改执勤数据</div>
                    <Button color="" onClick={() => setDialogPayload({ editSheetDisplay: false })}>
                        X
                    </Button>
                </Dialog.Title>
                <Dialog.Description className="text-sm text-blue-600 font-light italic" >
                    小心修改执勤记录,如果此条目为教员,请先修改学员记录。
                </Dialog.Description>
                <EditDutyRecord />
           
            </Dialog.Content>
        </Dialog.Root>
    );
}

export default EditDutyRecordSheet;
