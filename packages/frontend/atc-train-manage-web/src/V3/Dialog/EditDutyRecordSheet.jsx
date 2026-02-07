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

import { usePage,   } from "@utils";
import EditDutyRecord from "../Page2/SheetPage/LikeExcel/EditDutyRecord";

function EditDutyRecordSheet() {
    const { payload, setPayload } = usePage();
    const { editSheetDisplay } = payload;
    // const { data: positions, error, isLoading } = useSWR(API_URL.query_positions, FETCHER);
    // const { data: roles } = useSWR(API_URL.query_roles, FETCHER);

    return (
        <Sheet
            open={editSheetDisplay}
            onOpenChange={() => {
                setPayload((prev) => {
                    return { ...prev, editSheetDisplay: false };
                });
            }}
        >
            {/* <SheetTrigger asChild>
                <Button variant="outline">Open</Button>
            </SheetTrigger> */}
            <SheetContent className="border border-red-600 flex flex-col gap-2 overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>修改执勤记录</SheetTitle>
                    <SheetDescription>
                        此功能仅能修改执勤记录,如果此条目具备教员资格,请先检查或修改学员记录。
                    </SheetDescription>
                </SheetHeader>
                        <EditDutyRecord />

                <SheetFooter  className="border  border-red-600   mx-auto">
                    <SheetClose >
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

export default EditDutyRecordSheet;
