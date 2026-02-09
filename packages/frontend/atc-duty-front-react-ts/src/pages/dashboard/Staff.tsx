// components/Staff.tsx
import { useEffect, useState } from "react";
import { Button } from "@radix-ui/themes";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import type { StaffProps } from "../types";

dayjs.extend(duration);

const Staff: React.FC<StaffProps> = (props) => {
  const {
    id,
    username,
    position,
    dutyType,
    inTime,
    outTime,
    roleType,
    relatedDutyTableRowId,
    roleStartTime,
    roleEndTime,
    status,
  } = props;

  // 执勤时间计算
  const date1 = dayjs(inTime);
  const [inDutyTime, setInDutyTime] = useState<string>(
    dayjs.duration(dayjs().diff(date1)).format("H小时m分")
  );
  
  // 带教时间计算
  const date2 = dayjs(roleStartTime);
  const [inRoleTime, setInRoleTime] = useState<string>(
    dayjs.duration(dayjs().diff(date2)).format("H小时m分")
  );

  const [isOver2Hours, setIsOver2Hours] = useState<boolean>(
    dayjs().diff(inTime, "hours", true) >= 2.17
  );

  useEffect(() => {
    // 初始化计算
    setInDutyTime(dayjs.duration(dayjs().diff(inTime)).format("H小时m分"));
    setInRoleTime(dayjs.duration(dayjs().diff(roleStartTime)).format("H小时m分"));
    
    if (dayjs().diff(inTime, "hours", true) >= 2.17) {
      setIsOver2Hours(true);
    }

    // 定时器更新
    const timerId = setInterval(() => {
      const now = dayjs();
      
      if (now.diff(inTime, "hours", true) >= 2.17) {
        setIsOver2Hours(true);
      }

      setInDutyTime(dayjs.duration(now.diff(inTime)).format("H小时m分"));
      setInRoleTime(dayjs.duration(now.diff(roleStartTime)).format("H小时m分"));
    }, 15 * 1000);

    return () => clearInterval(timerId);
  }, [inTime, roleStartTime]);

  // 动态样式类名
  const containerClassName = `relative grid grid-cols-2 gap-1 border border-dashed rounded-lg px-2 py-1 mx-1 ${
    roleType === "教员" || roleType === "见习" ? "border-2 border-lime-500" : ""
  }`;

  const timeClassName = `text-sm font-black italic text-nowrap ${
    isOver2Hours ? "text-red-600" : "text-green-600"
  } ${roleType === null ? "text-gray-800" : ""}`;

  return (
    <div className={containerClassName}>
      <div className="flex items-center justify-center">
        {roleType === "教员" && (
          <label 
            className="text-blue-600 font-bold" 
            style={{ writingMode: "vertical-rl" }}
          >
            教员
          </label>
        )}
        {roleType === "见习" && (
          <label 
            className="text-lime-600 font-bold" 
            style={{ writingMode: "vertical-rl" }}
          >
            见习
          </label>
        )}

        <img
          className="max-w-[5rem] max-h-[4rem] aspect-auto"
          src={`${SERVER_URL}/${username}.jpg`}
          alt={username}
        />
      </div>
      
      <div className="flex flex-col flex-1 justify-between items-start">
        <h4 className={timeClassName}>
          {inDutyTime}
        </h4>
        
        {roleType === "教员" && (
          <h4 className="text-sm font-black italic text-blue-600 text-nowrap">
            {inRoleTime}
          </h4>
        )}

        <Button variant="soft" disabled>
          退出
        </Button>
      </div>
    </div>
  );
};

export default Staff;