import React, { useContext, useRef, useState, useEffect } from "react";
import { BitBusinessCardContext, EditBitState } from "../Context/BitBusinessCardContext";
import { ServerHttpURL } from "../../../utils";

function BusinessCardForm() {
    const { selectedCard,temp, setTemp } = useContext(BitBusinessCardContext);
    // const [temp, setTemp] = useState(null);
    const contactRefs = useRef([React.createRef()]);

    // useEffect(() => {
    //     // 处理下空array
    //     if (Array.isArray(selectedCard?.contact) && selectedCard?.contact !== 0) {
    //         setTemp({ ...selectedCard });
    //     } else {
    //         setTemp({ ...selectedCard, contact: [""] });
    //     }
    // }, [selectedCard]);



    const handleTextOnchange = React.useCallback(
        (e) => {
            e.preventDefault();
            const { name, value } = e.target;

            setTemp((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        },
        [temp, setTemp]
    );

    const handleAddContact = React.useCallback(
        (e, index) => {
            e.preventDefault();
            
            const newContacts = [...temp.contact, ""];
            setTemp((prevData) => ({
                ...prevData,
                contact: newContacts,
            }));
            // contactRefs.current.push(React.createRef());
        },
        [temp, setTemp]
    );

    const handleRemoveContact = React.useCallback(
        (index) => {
            const newContacts = [...temp.contact];
            newContacts.splice(index, 1);
            setTemp((prevData) => ({
                ...prevData,
                contact: newContacts,
            }));
            // contactRefs.current.splice(index, 1);
        },
        [temp,setTemp]
    );

    const handleContactChange = React.useCallback(
        (e, index) => {
            e.preventDefault();

            const newContacts = [...temp.contact];
            newContacts[index] = e.target.value;
            setTemp((prevData) => ({
                ...prevData,
                contact: newContacts,
            }));
        },
        [setTemp,temp]
    );

    const handleFileOnchange=React.useCallback(
        (e) => {
            e.preventDefault();
            const { name, files } = e.target;

            setTemp((prevData) => ({
                ...prevData,
                [name]: files[0],
            }));
        },
        [ setTemp]
    )



    return temp ? (
        <>
            <div className="text-start flex flex-row justify-start  items-center font-yahei">
                <img src="https://via.placeholder.com/100" alt="头像" className="w-24 h-24 rounded-full mb-4" />
                <div className="ml-[2rem] flex flex-col gap-1">
                    <div className="text-3xl font-bold flex flex-row items-end">
                        <span className="material-symbols-outlined">mood</span>
                        <input
                            className="ml-[1rem] border-b  w-full border-b-slate-500 focus:outline-none"
                            type="text"
                            placeholder="姓名"
                            name="name"
                            required
                            value={temp.name||""}
                            onChange={handleTextOnchange}
                        />
                        <span className="material-symbols-outlined">border_color</span>
                    </div>
                    <div className="text-2xl font-semibold flex flex-row items-end">
                        <span className="material-symbols-outlined">apartment</span>
                        <input
                            className="ml-[1rem] border-b  w-full border-b-slate-500 focus:outline-none"
                            type="text"
                            placeholder="公司名称"
                            name="company_name"
                            value={temp.company_name?temp.company_name:""}
                            required
                            onChange={handleTextOnchange}
                        />
                        <span className="material-symbols-outlined">border_color</span>
                    </div>
                    <div className="text-xl text-gray-600 flex flex-row items-end">
                        <span className="material-symbols-outlined">work</span>
                        <input
                            className="ml-[1rem] border-b w-full border-b-slate-500 focus:outline-none"
                            type="text"
                            placeholder="职务"
                            name="title"
                            value={temp.title}
                            onChange={handleTextOnchange}
                        />
                        <span className="material-symbols-outlined">border_color</span>
                    </div>
                </div>
            </div>
            <hr className="my-4" />
            <div className="text-start grid grid-cols-[2rem,auto] gap-2 ">
                <span className="material-symbols-outlined">call</span>
                <div className="text-gray-700 flex flex-col items-start gap-1 font-bold">
                    {temp.contact?.map((item, index) => {
                        return (
                            <div key={index} className="flex flex-row flex-1  w-full ">
                                <input
                                    className=" w-full border-b border-b-slate-500 focus:outline-none placeholder:italic placeholder:font-light"
                                    type="text"
                                    placeholder="138444582221(电话)"
                                    value={item}
                                    onChange={(e) => handleContactChange(e, index)}
                                />
                                <button onClick={() => handleRemoveContact(index)}>
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        );
                    })}
                    <span className=" text-zinc-400 font-medium font-yahei">
                        *格式为 联系方式(种类) 例如: 13812345678(手机) ; 747822932(QQ)
                    </span>
                    <button className="flex-shrink-1" onClick={handleAddContact}>
                        <span className="material-symbols-outlined  text-blue-500">add_box</span>
                    </button>
                </div>
            </div>
            <hr className="my-4" />
            <div className="text-start grid grid-cols-[2rem,auto] gap-2 g">
                <span className="material-symbols-outlined">public</span>
                <div className="text-gray-700 flex flex-row items-center">
                    <input
                        className="mx-[1rem] w-full border-b border-b-slate-500 focus:outline-none"
                        type="text"
                        placeholder="公司网站"
                        value={temp?.website}
                        name="website"
                        onChange={handleTextOnchange}
                    />
                </div>
                <span className="material-symbols-outlined">category</span>
                <div className="text-gray-700 flex flex-row items-center">
                    <textarea
                        rows="4"
                        className="mx-[1rem] w-full border-b border-b-slate-500 focus:outline-none"
                        type="text"
                        placeholder="公司主营产品"
                        value={temp?.product}
                        name="product"
                        onChange={handleTextOnchange}
                    />
                </div>
            </div>
            <hr className="my-4" />
            <div className="text-start grid grid-cols-[2rem,auto] gap-2 g">
                <span className="material-symbols-outlined">add_photo_alternate</span>
                <div className="flex flex-row gap-5">
                    {
                        <img
                            className="max-w-[300px]  max-h-[200px]  "
                            src={selectedCard?.frontImg ? ServerHttpURL + selectedCard?.frontImg : ""}
                            alt="未上传名片正面"
                        />
                    }
                    <div className="flex flex-col">
                        名片正面
                        <input type="file" name="frontImg" onChange={ handleFileOnchange} />
                    </div>
                </div>
                <span className="material-symbols-outlined">add_photo_alternate</span>
                <div className="flex flex-row gap-5">
                    {
                        <img
                            className="max-w-[300px]  max-h-[200px]  "
                            src={selectedCard?.frontImg ? ServerHttpURL + selectedCard?.backImg : ""}
                            alt="未上传名片正面"
                        />
                    }
                    <div className="flex flex-col">
                        名片背面
                        <input type="file" name="backImg" onChange={handleFileOnchange} />
                    </div>
                </div>
            </div>
        </>
    ) : (
        <></>
    );
}

export default BusinessCardForm;

// className=""
