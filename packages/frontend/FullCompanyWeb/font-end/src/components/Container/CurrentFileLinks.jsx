import React from "react";

const currentFileLinks = [
    {
        title: "采购订单确认",
        link: "https://docs.qq.com/sheet/DVEpsT290cm94cXJw?groupUin=ZrisAGfvIa8VXevKFQIr2w%253D%253D&tab=BB08J2&u=c68af4a7ffba4164aec3832d54241964",
    },
    {
        title: "韩晶威-鼎道内部报价单2021.(2)",
        link: "https://docs.qq.com/sheet/DVHRyb2ZiQm9HYWp5?groupUin=Bvn7gaWzL2%252BkbB6xyJRPdg%253D%253D&tab=BB08J3&u=c68af4a7ffba4164aec3832d54241964",
    },
];

export default function CurrentFileLinks() {
    return (
        <div style={{display:'flex',flexDirection:'row'}}>
            <div style={{border:'1px solid lightBlue',margin:'1em',padding:'1em'}}>
                <h2>2022年度</h2>
                <ul>
                    {currentFileLinks.map((i) => {
                        return (
                            <li style={{ listStyle: "none" }}>
                                <a href={i.link} title={i.title}>
                                    <h2>{i.title}</h2>{" "}
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div style={{border:'1px solid lightBlue',margin:'1em',padding:'1em'}}>
                <h2>2021年度</h2>
                <ul>
                    {currentFileLinks.map((i) => {
                        return (
                            <li style={{ listStyle: "none" }}>
                                <a href={i.link} title={i.title}>
                                    <h2>{i.title}</h2>{" "}
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
