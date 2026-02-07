import React from "react";
import { Button, Dialog } from "@radix-ui/themes";
import { usePage } from "@utils";
import AddNewDutyRecord from "../Page2/SheetPage/LikeExcel/AddNewDutyRecord";
import useDialog from "../../utils/hooks/useDialog";

function AddNewDutyRecordDialog() {
    const { dialogPayload,setDialogPayload } = useDialog();
    // const { data: positions, error, isLoading } = useSWR(API_URL.query_positions, FETCHER);
    // const { data: roles } = useSWR(API_URL.query_roles, FETCHER);

    return (
        <Dialog.Root
            open={dialogPayload.AddNewDutyRecordDialogDisplay}
            // onOpenChange={() => {
            //     setDialogPayload((prev) => {
            //         return { ...prev, editSheetDisplay: false };
            //     });
            // }}
        >
            <Dialog.Content className=" min-w-[60%] flex flex-col  overflow-y-auto ">
                <Dialog.Title className="flex flex-row justify-between ">
                    <div className="text-red-600">增加执勤数据</div>
                    <Button color="" onClick={() => setDialogPayload({ AddNewDutyRecordDialogDisplay: false })}>
                        X
                    </Button>
                </Dialog.Title>
                <Dialog.Description className="text-sm text-blue-600 font-light font-sans italic" >
                    添加执勤记录,如果此条目为教员,请添加关联数据ID(学员记录)。
                </Dialog.Description>
                <AddNewDutyRecord />
           
            </Dialog.Content>
        </Dialog.Root>
    );
}




export default AddNewDutyRecordDialog





