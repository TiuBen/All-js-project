import { useState } from "react";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
export const TreeItem = ({ item }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const onClick = (e, item) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(item);
        if (item.type === "folder") {
            setIsExpanded(!isExpanded);
        }
    };

    return (
        <li className="">
            <div onClick={(e) => onClick(e, item)} className="ml-1 cursor-pointer">
                <div className="flex items-center">
                    {item.type === "folder" ? (
                        isExpanded ? (
                            // <span className="material-symbols-outlined text-sm">expand_more</span>
                            <KeyboardArrowRightIcon/>
                        ) : (
                            <span className="material-symbols-outlined text-sm">chevron_right</span>

                        )
                    ) : (
                        ""
                    )}
                    {item.type === "folder" ? (
                        < >
                            📂
                            {/* <span className="material-symbols-outlined ">folder</span> */}
                            {item.name}
                        </>
                    ) : (
                        <div className="text-sm bg-slate-100">
                            📝
                            {/* <span className="material-symbols-outlined">description</span> */}
                            {item.name}
                        </div>
                    )}
                </div>

                {isExpanded && (
                    <ul className="ml-[1.5rem] text-sm">
                        {item.children.map((x, index) => {
                            return <TreeItem key={index} item={x} />;
                        })}
                    </ul>
                )}
            </div>
        </li>
    );
};
