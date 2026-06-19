import { useState, useEffect, forwardRef } from "react";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";


function isRight(isABCD,rightAns){
    console.log("right:"+rightAns+",isABCD:"+isABCD);
    if (rightAns==="T"&&isABCD==="A") {
        return true;
    }
    if (rightAns==="F"&&isABCD==="B") {
        return true;
    }
    if (rightAns==="A"&&isABCD==="A") {
        return true;
    }
    if (rightAns==="B"&&isABCD==="B") {
        return true;
    }
    if (rightAns==="C"&&isABCD==="C") {
        return true;
    }
    if (rightAns==="D"&&isABCD==="D") {
        return true;
    }
    return false;
}


function SelectElement({ isABCD, content, selectedItem = "", rightAns ,onClick }) {
    const [state, setState] = useState(null);

    console.log(rightAns)
    useEffect(() => {
        if (selectedItem.includes(isABCD)) {
            if (rightAns) {
                if (isRight(isABCD,rightAns)) {
                    setState(true);// correct
                } else {
                    setState(false);// wrong
                }
            } else {
                
            }
           
        } else {
            setState(null);// not selected
        }

        return () => {
            setState(null);
        };
    }, [isABCD,selectedItem,rightAns]);

    return (
        <button className={`flex flex-1 w-full flex-row gap-1 items-baseline border-b  hover:font-semibold ${isRight(isABCD,rightAns) ? "bg-blue-000" : ""}`}  onClick={onClick}>
            <div className=" relative">
                <span className="font-medium">{isABCD}.</span>
                {state === null ? (
                    <></>
                ) : state === true ? (
                    <DoneIcon
                        sx={{
                            position: "absolute",
                            left: "-0.5rem",
                            width: "2rem",
                            height: "2rem",
                            stroke: "#00dd00",
                            strokeWidth: 2,
                            zIndex: -1,
                        }}
                    />
                ) : (
                    <CloseIcon
                        sx={{
                            position: "absolute",
                            left: "-0.5rem",
                            width: "2rem",
                            height: "2rem",
                            stroke: "#ff0000",
                            strokeWidth: 2,
                            zIndex: -1,
                        }}
                    />
                )}
            </div>
            <label className=" text-start  flex-1">{content || ""}</label>
        </button>
    );
}  

  
export default SelectElement;