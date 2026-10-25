import { useState } from "react";
import ContentLayout from "../../Layout/ContentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { cn } from "../../utils/cn";
import { Plane, MapPin, Database, Settings2, Table, Table2 } from "lucide-react";
import AirplaneCompanySetting from "./components/AirplaneCompanySetting";
import AirportSetting from "./components/AirportSetting";
import DataSourcSetting from "./components/DataSourcSetting";
import FipsTableSetting from "./components/FipsTableSetting";
import EcyilangTableSetting from "./components/EcyilangTableSetting";

/**
 * ============================================================
 * SettingPage —— 设置页（左侧板块导航 + 右侧内容）
 * ------------------------------------------------------------
 * 入口：顶栏右侧的齿轮图标（MainPageLayout）→ 路由 /setting。
 * 与其它页一样套 ContentLayout（定高、侧栏可滚动、内容区填满），
 * 但内容不是「列表 + 筛选」，而是**设置板块**：
 *
 *   airlines   航司码（airplane_company_name_code）
 *   airports   机场码（airport_name_code）
 *   datasource 数据源说明（只读）
 *   flighttable 航班表的视图模式与列配置（原来挤在航班页里）
 *
 * ★ 四个板块**常驻挂载、只切显隐**：与 ChecklistEditor 的三面板同思路 ——
 *   切换板块时不清空各自表格的搜索词与滚动位置，返回时状态还在。
 *   代价是三张表在挂载时就各拉一次数据，但码表数据量很小（十几~几十条），可接受。
 * ------------------------------------------------------------
 * 码表数据统一由 store/settingStore.js 管理（两张表共用一个 store，
 * 行缓存按 kind 分开）；航班表的配置由 store/fips.store.js 管理。
 * ============================================================
 */

const SECTIONS = [
    { id: "airlines", label: "航司码", desc: "航空公司名称与 IATA / ICAO 代码", icon: Plane },
    { id: "airports", label: "机场码", desc: "机场中英文名与 IATA / ICAO 代码", icon: MapPin },
    { id: "datasource", label: "数据源", desc: "航班列表读取哪张表（可切换）", icon: Database },
    { id: "flighttable", label: "航班表", desc: "视图模式与列的显示 / 顺序", icon: Table },
    { id: "ecyilangtable", label: "花湖翼览表格设置", desc: "原始快照表的列显示 / 顺序 / 展示形态", icon: Table2 },
];

export default function SettingPage() {
    const [section, setSection] = useState("airlines");

    return (
        <ContentLayout
            sidebarWidth={248}
            sidebar={
                <>
                    {/* 板块导航 */}
                    <Card>
                        <CardHeader className="px-3 py-2">
                            <CardTitle className="flex items-center gap-1.5 text-[13px]">
                                <Settings2 size={14} className="text-primary-600" /> 系统设置
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-1.5">
                            <nav className="flex flex-col gap-0.5">
                                {SECTIONS.map((s) => {
                                    const Icon = s.icon;
                                    const active = section === s.id;
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => setSection(s.id)}
                                            className={cn(
                                                "flex cursor-pointer flex-col gap-0.5 rounded-md px-2.5 py-1.5 text-left transition-colors",
                                                active ? "bg-primary-50 text-primary-700" : "text-slate-600 hover:bg-slate-100"
                                            )}
                                        >
                                            <span className="flex items-center gap-1.5 text-[13px] font-medium">
                                                <Icon size={14} /> {s.label}
                                            </span>
                                            <span
                                                className={cn(
                                                    "pl-5 text-[11px] leading-tight",
                                                    active ? "text-primary-500" : "text-slate-400"
                                                )}
                                            >
                                                {s.desc}
                                            </span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </CardContent>
                    </Card>

                    {/* 底部说明 */}
                    <div className="rounded-md bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-400">
                        码表用于把航班数据里的中文名称换算成标准代码（IATA / ICAO），供生鲜保障与检查单自动匹配使用。
                        中文名称、各代码列都要求唯一，重复保存会提示冲突。
                    </div>
                </>
            }
        >
            {/* 四板块常驻挂载，只切显隐（保持各自的搜索词 / 滚动位置） */}
            <div className={cn("min-h-0 flex-1 flex-col", section === "airlines" ? "flex" : "hidden")}>
                <AirplaneCompanySetting />
            </div>
            <div className={cn("min-h-0 flex-1 flex-col", section === "airports" ? "flex" : "hidden")}>
                <AirportSetting />
            </div>
            <div className={cn("min-h-0 flex-1 flex-col", section === "datasource" ? "flex" : "hidden")}>
                <DataSourcSetting />
            </div>
            <div className={cn("min-h-0 flex-1 flex-col", section === "flighttable" ? "flex" : "hidden")}>
                <FipsTableSetting />
            </div>
            <div className={cn("min-h-0 flex-1 flex-col", section === "ecyilangtable" ? "flex" : "hidden")}>
                <EcyilangTableSetting />
            </div>
        </ContentLayout>
    );
}
