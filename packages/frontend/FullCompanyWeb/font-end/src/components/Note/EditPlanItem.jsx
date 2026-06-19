import React, { useState, useCallback, useEffect ,useRef} from "react";
import PropTypes from 'prop-types';


// |     姓名|  more
// |-----------------
// |   短期  |   长期
// |

const listItemStyle = { color: "red" };
const spanStyle = { color: "#72a24d" };
const ItemState = { modify: "modify", delete: "delete", default: "default" };
 

function EditPlanItem(props) {
    const { initState=ItemState.default} = props;
    // const { initState} = props;
    //
    const [itemState, setItemState] = useState(initState);
    const [content, setContent] = useState("这是一个员工写的一条任务计划");
    const [comment, setComment] = useState("反馈批示");
    //
    const [value, setValue] = useState(null);
    //
    const [isEdit, setIsEdit] = useState(false);
    const [beginEdit, setBeginEdit] = useState(false);
    const [canSubmit, setCanSubmit] = useState(false);


    const ref = useRef("initialValue");

    const defaultItem = (
        <>
            <li style={listItemStyle}>{content}</li>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    var _state = ItemState.modify.toString();
                    setItemState(_state);
                }}
            >
                修改
            </button>
            <span style={spanStyle}>{comment}</span>
        </>
    );

    useEffect(() => {
        if (value!==null && value!==content ) {
            setCanSubmit(true)
        }else{
            setCanSubmit(false)
        }
    }, [value,content])
    



    const modifyItem = (
        <div style={{display:'flex',flexDirection:'column',justifyContent:'flex-end',alignItems:'flex-start'}}>
            <textarea
                onChange={(e) => {
                    e.preventDefault();
                    setValue(e.target.value);
                }}
                placeholder={"请修改计划"}
                value={value?value:content}
                ref={ref}
            />

            <button
                disabled={!canSubmit}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setComment("已经修改,等待批复");
                    setContent(value);
                    setItemState(ItemState.default)
                }}
            >
                确认修改并提交
            </button>
            <button onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setItemState(ItemState.default)
                }}>取消修改并回退</button>
            <span style={spanStyle}>{comment}</span>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    setComment("删除该任务计划,已经提交,等待反馈!");
                    setItemState(ItemState.delete);
                }}
            >
                删除该任务计划
            </button>
        </div>
    );

    const deleteItem = (
        <>
            <li style={listItemStyle}>
                <del>{content}</del>
            </li>
            <span style={spanStyle}>"删除该任务计划,已经提交,等待反馈!"</span>
            <button>返回</button>
        </>
    );

    const getItem = (itemState) => {
        console.log("itemState");
        console.log(itemState);
        switch (itemState) {
            case ItemState.delete:
                return deleteItem;
            case ItemState.modify:
                return modifyItem;
            default:
                return defaultItem;
        }
    };



    return <div className="one-plan-item">{getItem(itemState)}</div>;
}

EditPlanItem.propTypes={
    content:PropTypes.string.isRequired,
    comment:PropTypes.string
}


export default  EditPlanItem;