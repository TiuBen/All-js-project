import React from "react";

function SeatCard({ dutyType, totalHours, count, avgHours, minHours, maxHours }) {
    return (
        <div className="flex flex-col items-center border border-gray-200 rounded-lg p-2 gap-1 text-center self-stretch min-w-[8rem]">
            <h3 className="font-black text-blue-600 text-lg">{dutyType}</h3>
            <div className="flex flex-col gap-1 w-full text-sm">
                <div className="flex justify-between px-2">
                    <span className="text-gray-600">总小时:</span>
                    <span className="font-medium">{totalHours}</span>
                </div>
                <div className="flex justify-between px-2">
                    <span className="text-gray-600">人次:</span>
                    <span className="font-medium">{count}</span>
                </div>
                <div className="flex items-center justify-between px-2 ">
                    <span className="text-gray-600">平均小时:</span>
                    <span className=" text-xl text-blue-600 font-bold">{avgHours}</span>
                </div>
                <div className="flex items-center justify-start px-2 ">
                    <span className="text-gray-600">最短:</span>
                    <span className="   font-bold"> {minHours} </span>
                    <span className="text-gray-600">最长:</span>
                    <span className="   font-bold">{maxHours}</span>
                </div>
            </div>
        </div>
    );
}

export default SeatCard;
