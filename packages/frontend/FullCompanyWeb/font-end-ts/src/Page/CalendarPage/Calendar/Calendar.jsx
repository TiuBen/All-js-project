import { MonthLarge, RangeType } from "./Component/MonthLarge";
import MonthMini from "./Component/MonthMini";
import useSWR from "swr";
import { Request,useModal } from "../../../utils/index";
import { useState } from "react";
import dayjs from "dayjs";

const fetcher = (url) => Request.get(url).then((res) => res);

const getListData = (value) => {
    // 筛选时间
    return [];
};

function Calendar() {
    // <Calendar items={""} onClick={() => {}} startDate={""} range={""} />;
    const { data, error, isLoading } = useSWR("todo", fetcher);

    const { visible,setVisible,setModalContent } = useModal();

    const addActivity = () => {};
    const removeActivity = () => {};

    const [selectedDate, setSelectedDate] = useState(new Date());

    const [range, setRange] = useState({ count: 42, rangeType: RangeType.FullMonth });

    const cellRender = (current) => {
        // console.log("cellRender");
        return {
            "2024-01-03": <ul>{<div>ddddddd</div>}</ul>,
        };
    };
    const headerRender = () => {




    };

    return (
        <div id="calendar" className=" flex min-h-[2vh] flex-1 flex-col">
            <div className="">
                <button
                    style={{ all: "revert" }}
                    onClick={() => {
                        setVisible(!visible);
                    }}
                >
                    openModal
                </button>
                <button
                    style={{ all: "revert" }}
                    onClick={() => {
                        setModalContent(<div style={{backgroundColor:"green"}}>dddddddddddddddddddddddddddddddd</div>);
                    }}
                >
                    setContent
                </button>
                <button
                    style={{ all: "revert" }}
                    onClick={() => {
                        setSelectedDate(new Date());
                    }}
                >
                    今天
                </button>
                <input
                    style={{ all: "revert" }}
                    type="number"
                    onChange={(e) => {
                        setRange({ count: e.target.value, rangeType: RangeType.CountedDays });
                    }}
                />

                <button
                    style={{ all: "revert" }}
                    onClick={() => {
                        setRange({ count: 5, rangeType: RangeType.WorkDays5 });
                    }}
                >
                    工作日
                </button>
                <button
                    style={{ all: "revert" }}
                    onClick={() => {
                        setRange({ count: 7, rangeType: RangeType.FullWeekDays });
                    }}
                >
                    一周
                </button>
                <button
                    style={{ all: "revert" }}
                    onClick={() => {
                        setRange({ count: 42, rangeType: RangeType.FullMonth });
                    }}
                >
                    一月
                </button>
            </div>
            <div className="flex flex-1 flex-row">
                <MonthMini
                    selectedDate={selectedDate}
                    onCellClick={(value) => {
                        console.log(dayjs(value).format("YYYY-MM-DD"));
                        console.log(value);
                        setSelectedDate(value);
                    }}
                />
                <MonthLarge
                    rangeType={range.rangeType}
                    selectedDate={selectedDate}
                    cellRender={cellRender}
                    onCellClick={() => {}}
                    headerRender={headerRender}
                    onHeaderClick={() => {
                        console.log("====onHeaderClick");
                        setVisible(!visible);
                        setModalContent(<div style={{backgroundColor:"green"}}>添加每日工作计划</div>);


                    }}
                />
            </div>
        </div>
    );
}

export { Calendar };
