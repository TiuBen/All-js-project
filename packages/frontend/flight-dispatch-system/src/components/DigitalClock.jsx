import { useEffect, useState } from "react";

function pad(n) {
    return String(n).padStart(2, "0");
}

/**
 * 跳动时钟：本地（黑色）+ UTC（橙色，含标签），上下摆放，按秒变化，无闪烁动画
 */
export default function DigitalClock() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const fmt = (d) =>
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
            d.getMinutes()
        )}:${pad(d.getSeconds())}`;

    const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

    return (
        <div className="flex flex-col time-text items-end gap-0.5">
            <div className="flex items-center gap-1.5">
                <span className=" text-slate-700">LOC</span>
                <span className=" text-slate-700">{fmt(now)}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <span className="  text-orange-600">UTC</span>
                <span className=" text-orange-500">{fmt(utc)}</span>
            </div>
        </div>
    );
}
