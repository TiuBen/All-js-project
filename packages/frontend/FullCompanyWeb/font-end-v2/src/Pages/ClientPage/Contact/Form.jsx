import React, { useState, useContext, useEffect } from "react";
import { DataState,DataContext } from "../../../utils";
import { ServerHttpURL } from "../../../utils";

function Form({ initValue }) {
    const [_formData, setFormData] = useState(initValue);
    const { tempData, setEditorState, setFormReturnValue } = useContext(DataContext);

    // *监听是否在原数据上进行了修改
    useEffect(() => {
        if (JSON.stringify(tempData) !== JSON.stringify(_formData)) {
            setEditorState(DataState.EDIT_Changed);
        } else {
            setEditorState(DataState.EDIT_NotChanged);
        }
        setFormReturnValue(_formData);
    }, [tempData, _formData, setEditorState,setFormReturnValue]);
    // *获取返回值
    useEffect(() => {
        setFormReturnValue(_formData);
    }, [ _formData,setFormReturnValue]);
    // 刚进入时候
    useEffect(() => {
        setEditorState(DataState.EDIT_NotChanged);
        return ()=>{
            setEditorState(null);
        }
    }, [ setEditorState]);


    const handleTextOnchange = React.useCallback(
        (e) => {
            e.preventDefault();
            const { name, value } = e.target;

            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        },
        [ setFormData]
    );

    const handleAddContact = React.useCallback(
        (e, index) => {
            e.preventDefault();

            const newContacts = [..._formData?.contact, ""];
            setFormData((prevData) => ({
                ...prevData,
                contact: newContacts,
            }));
            // contactRefs.current.push(React.createRef());
        },
        [_formData, setFormData]
    );

    const handleRemoveContact = React.useCallback(
        (index) => {
            const newContacts = [..._formData?.contact];
            newContacts.splice(index, 1);
            setFormData((prevData) => ({
                ...prevData,
                contact: newContacts,
            }));
            // contactRefs.current.splice(index, 1);
        },
        [_formData, setFormData]
    );

    const handleContactChange = React.useCallback(
        (e, index) => {
            e.preventDefault();

            const newContacts = [..._formData?.contact];
            newContacts[index] = e.target.value;
            setFormData((prevData) => ({
                ...prevData,
                contact: newContacts,
            }));
        },
        [setFormData, _formData]
    );

    const handleFileOnchange = React.useCallback(
        (e) => {
            e.preventDefault();
            const { name, files } = e.target;

            setFormData((prevData) => ({
                ...prevData,
                [name]: files[0],
            }));
        },
        [setFormData]
    );

    return (
        <form className="shadow-md border rounded-lg p-4 relative">
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
                            value={_formData?.name || ""}
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
                            value={_formData?.company_name ? _formData?.company_name : ""}
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
                            value={_formData?.title}
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
                    {_formData?.contact?.map((item, index) => {
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
                        value={_formData?.website}
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
                        value={_formData?.product}
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
                            src={_formData?.frontImg ? ServerHttpURL + _formData?.frontImg : ""}
                            alt="未上传名片正面"
                        />
                    }
                    <div className="flex flex-col">
                        名片正面
                        <input type="file" name="frontImg" onChange={handleFileOnchange} />
                    </div>
                </div>
                <span className="material-symbols-outlined">add_photo_alternate</span>
                <div className="flex flex-row gap-5">
                    {
                        <img
                            className="max-w-[300px]  max-h-[200px]  "
                            src={_formData?.frontImg ? ServerHttpURL + _formData?.backImg : ""}
                            alt="未上传名片正面"
                        />
                    }
                    <div className="flex flex-col">
                        名片背面
                        <input type="file" name="backImg" onChange={handleFileOnchange} />
                    </div>
                </div>
            </div>
        </form>
    );
}

export default Form;
