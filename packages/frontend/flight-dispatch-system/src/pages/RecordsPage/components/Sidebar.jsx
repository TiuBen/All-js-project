import FlightSearchCard from "../../../components/search/FlightSearchCard";
import DateFilterPanel from "../../../components/ui/DateFilterPanel";

/**
 * ============================================================
 * RecordsPage 私有 Sidebar —— 左侧边栏
 * ------------------------------------------------------------
 * 搜索卡 + 日期筛选（带记录标记点）
 * ============================================================
 */
export default function Sidebar({ keyword, onKeywordChange, matchCount, onRefresh, dayMarkers }) {
    return (
        <div className="shrink-0 space-y-4">
            <FlightSearchCard
                keyword={keyword}
                onKeywordChange={onKeywordChange}
                matchCount={matchCount}
                placeholder="航班号 / 检查单 / 检查人 / 机型..."
                onRefresh={onRefresh}
            />
            <DateFilterPanel dayMarkers={dayMarkers} />
        </div>
    );
}
