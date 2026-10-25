import React, { useState } from "react";
import VideoCheckItem from "../Editor/Components/VideoCheckItem";
import ChecklistToolbar from "./Components/ToolBar/Toolbar";
import ContentLayout from "../../../Layout/ContentLayout";
import { useChecklistStore } from "../../../store/checklistEditorPage.store";
import { CARGO_VIDEO_FOCUS, SHUNHANG_VIDEO_FOCUS, PASSENGER_VIDEO_FOCUS } from "../Const/index";
import { cargoBypassFlight } from "../Const/index";
import VideoPanel from "./Components/VideoPanel";
import MainCheckItem from "./Components/MainCheckItem";
const MAIN = [
    {
        uuid: "4b411293-c1f8-4ce5-8db4-9e4636aff6ba",
        eventId: "E003",
        category: "main",
        name: "开始挡轮挡",
        desc: "入位时间+0分钟",
        auxiliaries: [
            {
                uuid: "6904f6d9-ec2e-4e8d-a671-8c43ad85d750",
                eventId: "E004",
                category: "auxiliary",
                name: "接地面电源",
                desc: "需求申请时间+15分钟",
            },
            {
                uuid: "6904f6d9-ec2e-4e8d-a671-23423424234242",
                eventId: "E005",
                category: "auxiliary",
                name: "接地面电源",
                desc: "需求申请时间+15分钟",
            },
        ],
    },
    {
        uuid: "4b411293-c1f8-4ce5-8db4-312312312313",
        eventId: "E006",
        category: "main",
        name: "开始挡轮挡",
        desc: "入位时间+0分钟",
        auxiliaries: [
            {
                uuid: "342234-ec2e-4e8d-a671-8c43ad85d750",
                eventId: "E007",
                category: "auxiliary",
                name: "接地面电源",
                desc: "需求申请时间+15分钟",
            },
            {
                uuid: "43242342334-ec2e-4e8d-a671-23423424234242",
                eventId: "E008",
                category: "auxiliary",
                name: "接地面电源",
                desc: "需求申请时间+15分钟",
            },
        ],
    },
];

const VIDEO = {
    uuid: "3bbec381-e6e5-4790-adec-d85209f10b5f",
    name: "视频监管检查重点（入位前检查）",
    items: [
        {
            uuid: "b82f01db-4b0e-4bdf-80d7-398384ce7075",
            name: "机务人员在航班预计到达前5分钟接机人员对机位适用性进行检查。",
        },
        {
            uuid: "cfd68cbe-c6d2-48e2-9453-2fb93e585c9a",
            name: "人员、车辆、设备、货物、行李在指定区域等待。",
        },
        {
            uuid: "c6139e96-a537-4b09-9632-cedbbb4d253a",
            name: "保障作业车辆在等待时，驾驶员应随车等候，所有设备应有人看守。",
        },
        {
            uuid: "719dc7f9-571e-4952-99f4-f7597fc97ece",
            name: "使用目视泊位引导系统时，接机人员应在目视泊位引导系统紧急停止装置前值守，遇特殊情况应使用停止按钮，并及时转换人工引导。",
        },
        {
            uuid: "089d3343-20f1-44a8-9c1d-b8c93ed81325",
            name: "车辆、设备必须制动或固定，并设置轮挡，液压装置处于回收状态。",
        },
        {
            uuid: "2cef1ead-d69f-4dbf-991b-d64b251f0225",
            name: "任何车辆、人员不得从航空器和接机人员（或泊位引导系统）之间穿行。",
        },
        {
            uuid: "b58a9ac7-dc37-44d5-b269-1bd3322e0578",
            name: "将飞机引导/拖靠到指定的机位，并放置轮挡、警示锥。",
        },
        {
            uuid: "39fd4e1d-adbc-42aa-8ec7-9a5e34bf63cb",
            name: "安全停泊后，接机人员向靠机操作人员给靠机指令。",
        },
    ],
};

function MainList({ mains, selectedMainUuid, onSelect }) {
    return (
        <div className="flex  min-h-0 flex-col gap-2">
            {mains.map((item, index) => {
                const selected = item.uuid === selectedMainUuid;

                return (
                    <>
                        <MainCheckItem
                            node={item}
                            key={item.uuid}
                            index={index}
                            selected={selected}
                            onSelect={onSelect}
                        />
                    </>
                );
            })}
        </div>
    );
}
/**
 * 辅助项列表：根据传入的 main 渲染其 auxiliaries
 */
function Auxiliary({ main }) {
    if (!main) {
        return <div className="text-gray-400">请先选择一个主项</div>;
    }

    return (
        <div className="p-2 border rounded bg-gray-50">
            <div className="font-semibold mb-2">
                {main.eventId} - {main.name} 的辅助项
            </div>
            {main.auxiliaries?.length ? (
                main.auxiliaries.map((aux) => (
                    <div key={aux.uuid} className="mb-2 p-2 border rounded bg-white">
                        <div className="text-sm text-gray-500">{aux.eventId}</div>
                        <div>{aux.name}</div>
                        <div className="text-sm text-gray-500">{aux.desc}</div>
                    </div>
                ))
            ) : (
                <div className="text-gray-400">暂无辅助项</div>
            )}
        </div>
    );
}

function Editor({ main = cargoBypassFlight }) {
    const [selectedMainUuid, setSelectedMainUuid] = useState(null);
    // 根据 uuid 找到当前选中的 main 对象
    const selectedMain = main[0];
    const mainColVisible = useChecklistStore((s) => s.mainColVisible);
    const auxColVisible = useChecklistStore((s) => s.auxColVisible);
    const videoColVisible = useChecklistStore((s) => s.videoColVisible);
    const templateType = useChecklistStore((s) => s.templateType);

    const selectedVideo = templateType.includes("货运")
        ? CARGO_VIDEO_FOCUS
        : templateType.includes("顺航")
        ? SHUNHANG_VIDEO_FOCUS
        : PASSENGER_VIDEO_FOCUS;
    return (
        <ContentLayout>
            <ChecklistToolbar />
            {/* min-h-0 是必须的：flex 项默认 min-height:auto，会拒绝收缩到内容高度以下
                → 这一行会被最长的列撑高，列高 = 内容高，overflow-y-auto 永远没东西可滚
                （内容被 ContentLayout 的 overflow-hidden 直接裁掉）。
                加 min-h-0 后本行高度 = 剩余空间（确定值），列才能各自内部滚动。 */}
            <div className="flex min-h-0 flex-row gap-2 flex-1">
                <div className={`${!mainColVisible ? "hidden" : ""}  flex-1 overflow-y-auto`}>
                    <MainList
                        mains={main.schema}
                        selectedMainUuid={selectedMainUuid}
                        onSelect={(uuid) => setSelectedMainUuid(uuid)}
                    />
                </div>
                <div className={`${!auxColVisible ? "hidden" : ""} flex-1 overflow-y-auto `}>
                    <Auxiliary main={selectedMain} />
                </div>
                <div className={`${!videoColVisible ? "hidden" : ""} flex-1 overflow-y-auto `}>
                    <VideoPanel groups={selectedVideo.groups} />
                </div>
            </div>
        </ContentLayout>
    );
}

export default Editor;

// main
// ├── input type time
// ├── input type text
// └── auxiliary
//     ├── input type text
//     ├── input type file
//     └── input type time
//     └── auxiliary
//     ├── input type text
//     ├── input type file
//     └── input type time
