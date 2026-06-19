import React from "react";
import { useNavigate  } from "react-router-dom";
import { ToolBarVButton, HorizontalTools, VLine,  } from "../../../../Components/index";


function DisplayPageToolsBar() {
   const navigate=useNavigate ();
    return (
        <HorizontalTools>
            <ToolBarVButton
                title={"新建"}
                icon={"playlist_add"}
                tip={"新建一个个人报销单"}
                onClick={(e) => {
                    console.log("ddddd");
                    navigate("create");
                }}
            />
            <VLine />
            <ToolBarVButton title={"表格"} icon={"format_list_bulleted"} tip={"Excel样式展示"} />
            <ToolBarVButton title={"新建"} icon={"format_align_right"} tip={"详细的Excel"} />
            <ToolBarVButton title={"新建"} icon={"width_wide"} tip={"卡片展示"} />
        </HorizontalTools>
    );
}

export  {DisplayPageToolsBar};
