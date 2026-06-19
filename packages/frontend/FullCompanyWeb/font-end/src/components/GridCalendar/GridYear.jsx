import React from "react";
import GridMonth from "./GridMonth";
import "./GridYear.css";
import "./Calendar.css";


export default function GridYear(props) {
    const {YYYY,MM,DD}=props;

    const months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

    return (
        <div className="year-container">
            <div className="flex" style={{ border: "1px solid red", minHeight: "200px" }}>
                <div className="year-grid border ">
                    {months.map((month, index) => {
                        return (
                            <div
                                key={"year" + month + "" + index}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    border: "1px solid red",
                                    borderRadius: "2rem",
                                }}
                            >
                                <h4 className='better-text-font' style={{display:'flex'}}>{month}</h4>
                                <div
                                    style={{
                                        flex: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        border: "1px solid green",
                                    }}
                                >
                                    <GridMonth year={2022} month={index} isInYear={true}/>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
