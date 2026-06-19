import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BillContext } from "../../Context/BillContext";
import { ToolBarVButton, HorizontalTools, VLine, FlexibleSpace } from "../../../../Components/index";
import { ServerHttpURL } from "../../../../utils/index.js";

function EditPageToolsBar() {
    const navigate = useNavigate();
    const { BillHeader, BillBody } = useContext(BillContext);

    const postBillToServer = () => {
        console.log(JSON.stringify(BillHeader));
        console.log(BillBody);

        var formData = new FormData();
        formData.append("title", BillHeader.title);
        formData.append("companyName", BillHeader.companyName);
        formData.append("applyTime", BillHeader.applyTime);
        BillBody.forEach((billItem, index) => {
            var _temp = { title: billItem.title, price: billItem.price, count: billItem.count, files: [] };

            for (const [key, value] of Object.entries(billItem.attachment)) {
                console.log(`${key}: ${value}`);
                console.log(value);
                console.log("filename:" + value.name);
                _temp.files.push(value.name);
                formData.append("files", value, encodeURI(value.name));
            }

            formData.append("billItems", JSON.stringify(_temp));
        });

        // formData.append("title", BillHeader.title);

        fetch(`${ServerHttpURL}file`, {
            method: "POST",
            // headers: {
            //     // "content-Type": "multipart/form-data",
            //     boundary: "",
            // },
            body: formData,
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                navigate("detail");
            })
            .catch((e) => console.error(e));
    };

    return (
        <HorizontalTools>
            <ToolBarVButton title={"返回"} icon={"backspace"} tip={"新建一个个人报销单"} />
            <VLine />
            {/* <FlexibleSpace /> */}
            <ToolBarVButton title={"重做"} icon={"replay"} tip={"新建一个个人报销单"} />
            <ToolBarVButton title={"保存"} icon={"folder"} tip={"新建一个个人报销单"} onClick={postBillToServer} />
            <ToolBarVButton title={"预览"} icon={"remove_red_eye"} tip={"新建一个个人报销单"} />
            <ToolBarVButton title={"下载"} icon={"download"} tip={"新建一个个人报销单"} />
            <ToolBarVButton title={"PDF"} icon={"picture_as_pdf"} tip={"新建一个个人报销单"} />
        </HorizontalTools>
    );
}

export { EditPageToolsBar };
