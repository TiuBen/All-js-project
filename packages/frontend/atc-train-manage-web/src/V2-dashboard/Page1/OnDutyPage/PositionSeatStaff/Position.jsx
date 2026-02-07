import React from "react";
import { Button } from "@radix-ui/themes";
import Seat from "./Seat";

//*     Position
//*         |
//*    Seat    Seat
//*    |       |
//*    Staff   Staff
//*    Staff   Staff

function Position(props) {
    const { position, dutyType } = props;

    return (
        <div>
            <div className="border rounded-lg flex  flex-col items-center gap-2 p-1 self-stretch">
                <h2 className="font-black text-xl">{position}</h2>
                <div className="flex flex-row gap-2 p-1">
                    {Array.isArray(dutyType) ? (
                        <>
                            {dutyType.map((x, index) => {
                                return <Seat position={position} dutyType={x} key={index} />;
                            })}
                        </>
                    ) : (
                        <Seat position={position} />

                    )}
                </div>
            </div>
        </div>
    );
}

export default Position;
