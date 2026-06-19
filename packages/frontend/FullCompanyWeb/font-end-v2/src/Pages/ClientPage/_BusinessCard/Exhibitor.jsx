import React, { useContext } from "react";
import { BitBusinessCardContext } from "../Context/BitBusinessCardContext";
import { ServerHttpURL } from "../../../utils";

function Exhibitor() {
    const { selectedCard, setIsEdit } = useContext(BitBusinessCardContext);
    return selectedCard ? (
        < >
        
            <div className="text-start flex flex-row justify-start  items-center">
                <img src="https://via.placeholder.com/100" alt="Profile" className="w-24 h-24 rounded-full mb-4" />
                <div className="ml-[2rem] flex flex-col gap-1">
                    <div className="text-3xl font-bold flex flex-row items-end">
                        {selectedCard.name || "未填写该联系人姓名"}
                    </div>
                    <div className="text-2xl font-semibold flex flex-row items-end">
                        {selectedCard.company_name || "未填写公司名称"}
                    </div>
                    <div className="text-xl text-gray-600 flex flex-row items-end">
                        {selectedCard?.title || "未填写职务"}
                    </div>
                </div>
            </div>
            <hr className="my-4" />
            <div className="text-start grid grid-cols-[2rem,auto] gap-2  items-start">
                <span className="material-symbols-outlined ">call</span>
                <div className="text-gray-700 flex flex-col  justify-start  ">
                    {selectedCard?.contact?.map((p, index) => {
                        return <div key={index}>{p}</div>;
                    }) || "未填写联系方式"}
                </div>
                <span className="material-symbols-outlined">public</span>
                <div className="text-gray-700 flex flex-row items-center">
                    {<p>{selectedCard?.website || "未填写公司网站"}</p>}
                </div>
                <span className="material-symbols-outlined">category</span>
                <div className="text-gray-700 flex flex-row items-center">
                    {<p>{selectedCard?.product || "未填写公司主营产品"}</p>}
                </div>
                <span className="material-symbols-outlined">add_photo_alternate</span>
                <div >
                    {
                        <img
                            className="max-w-[300px]  max-h-[200px]  "
                            src={selectedCard?.frontImg ? ServerHttpURL + selectedCard?.frontImg : ""}
                            alt="未上传名片正面"
                        />
                    }
                </div>
                <span className="material-symbols-outlined">add_photo_alternate</span>
                <div >
                    {
                        <img
                            className="max-w-[300px]  max-h-[200px]  "
                            src={selectedCard?.backImg ? ServerHttpURL + selectedCard?.backImg : ""}
                            alt="未上传名片背面"
                        />
                    }
                </div>
            </div>
        </>
    ) : (
        <></>
    );
}

export default Exhibitor;
