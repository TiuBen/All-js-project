import { Button } from "@radix-ui/themes";
import React, { useState, useEffect } from "react";
//*     Position
//*         |
//*    Seat    Seat
//*    |       |
//*    Staff   Staff
//*    Staff   Staff
//*

function Seat(props) {
    const { position, dutyType } = props;
    // const { setDialogPayload } = useDialog();
    // const { onDutyUsers, setSelectedPosition, putDutyRecord } = useStore();

    return (
        <div className="flex flex-col items-center border border-gray-200 rounded-lg p-1 gap-1 text-center self-stretch">
            <div className="flex flex-row items-center gap-2">
                {dutyType && <h3 className="font-black text-blue-600 text-lg">{dutyType}</h3>}
                <Button style={{ marginTop: "auto" }} disabled={true}>
                    接班
                </Button>
            </div>
            {/* {onDutyUsers
                .filter((duty) => duty.position === position && duty.dutyType === dutyType)
                .map((duty, index) => (
                    <div key={index}>
                        <Staff {...duty} key={index} />
                    </div>
                ))} */}
        </div>
    );
}

export default Seat;
