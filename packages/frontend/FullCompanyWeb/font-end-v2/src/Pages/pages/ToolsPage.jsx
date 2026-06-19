import { NavCard } from "../../Components/index";

function ToolsPage() {
    return (
        <div>
            ToolsPage
            <NavCard url={"guigeshu"} title={"规格书制作"} detail={"使用该功能制作风扇的规格书"} />
            <NavCard url={"quotation"} title={"风扇历史报价"} detail={"请利用好以前风扇产品的报价清单"} />
            <NavCard url={"simple"} title={"快递登记"} detail={"登记寄出/收取的快递,特别是由本公司付费"} />
            <NavCard title={"样品登记"} detail={"免费 付费 用途 登记拍照 如果寄出也要存档"} />
        </div>
    );
}

export default ToolsPage;
