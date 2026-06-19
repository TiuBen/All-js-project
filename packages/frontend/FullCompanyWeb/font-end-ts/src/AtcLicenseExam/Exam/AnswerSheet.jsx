import React from "react";

function AnswerSheet() {
    return (
        <div className="relative p-4 bg-white">
            <h3 className="border-b-2 border-black text-center">答题卡</h3> 
            <div className="flex flex-row gap-2">
                <div className="flex flex-row  justify-center items-center gap-2">
                    <div className="w-[1rem] h-[1rem]  aspect-square border border-blue-300 rounded-sm bg-slate-300 text-center "></div>{" "}
                    未作答
                </div>
                <div className="flex flex-row  justify-center items-center gap-2 ">
                    <div className="w-[1rem] h-[1rem]  aspect-square border border-blue-500 bg-blue-500 rounded-sm text-center "></div>{" "}
                    已作答
                </div>
                <div className="flex flex-row  justify-center items-center gap-2">
                    <div className="w-[1rem] h-[1rem]  aspect-square border border-blue-300 rounded-sm bg-slate-300  flex justify-center items-center text-center  ">
                        ?
                    </div>
                    标记
                </div>
            </div>
        </div>
    );
}

export default AnswerSheet;
