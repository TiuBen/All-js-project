import React from "react";

function List({ items, onSelect,selectedItem,isEditingOrNot }) {
    return (
        <div>
            <input type="search" placeholder="搜索" />
            <ul className="flex flex-col gap-1 ">
                {items.map((item, index) => {
                    return (
                        <li
                            key={item.uuid}
                            className=" flex flex-row justify-start px-2 hover:border hover:bg-zinc-300 items-center relative border rounded-lg  bg-zinc-50"
                        >
                            <input
                                id={"item:" + index}
                                type="radio"
                                // name="options"
                                // key={"input"+ p.uuid}
                                className="disabled:text-slate-500 disabled:cursor-not-allowed peer"
                                onClick={onSelect}
                                readOnly
                                checked={item.uuid===selectedItem.uuid}
                                disabled={isEditingOrNot}
                            />
                            <label
                                htmlFor={"item:" + index}
                                className="mx-2 flex flex-row flex-1 items-center justify-between peer-checked:text-blue-600 peer-disabled:text-slate-500 peer-disabled:cursor-not-allowed "
                            >
                                <span className="text-xl font-semibold">{item?.name}</span>
                                <span className="text-sm">{item?.company_name}</span>
                            </label>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export  {List};
