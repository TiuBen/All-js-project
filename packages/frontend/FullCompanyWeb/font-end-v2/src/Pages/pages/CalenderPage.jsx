import { useEffect, useState } from "react";
import { DayCell, MonthLarge } from "../../Components/MsCanlendar/Component/MonthLarge";

function CalenderPage() {
    const [testAct, setTestAct] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3000/mock/calendarActivities.json")
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                // console.log(data);
                console.log(Array.isArray(data.activities));
                setTestAct(data.activities);
            });

        // return () => {
        //   setTestAct({});
        // };
    }, []);

    return (
        <div className="flex flex-col w-full h-full main-container">
            <div
                className="w-full h-16 min-h-16 max-h-16 bg-blue-50"
                style={{
                    boxShadow: "0 2px 2px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.19)",
                }}
            >
                {" "}
                CalenderPage tools
            </div>
            <div className="flex flex-row  flex-grow mt-1 overflow-hidden">
                <div
                    className="flex h-full flex-grow flex-shrink-1 mr-1"
                    style={{
                        boxShadow: "0 2px 2px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.19)",
                    }}
                >
                    <MonthLarge>
                        <DayCell date={Date.now().toLocaleString} activities={testAct} />
                      {/* <div className="overflow-hidden	">

                      </div> */}
                    </MonthLarge>
                </div>
                <div className="w-40 bg-gray-100 "> 详细 </div>
            </div>
        </div>
    );
}

export default CalenderPage;
