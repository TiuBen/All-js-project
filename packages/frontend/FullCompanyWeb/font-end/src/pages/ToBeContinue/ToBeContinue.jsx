import React,{useState,useEffect} from "react";
const colors = [
    "Amber",
    "Apricot",
    "Arylide yellow",
    "Fuchsia",
    "ForestGreen",
    "DeepPink",
    "Indigo",
    "Aqua",
    "Gold",
    "Apple green",
    "BlueViolet",
    "Alice blue",
    "AquamarineAzure",
];

function Random(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}

function Test(){
    const [index, setIndex] = useState(0);
    const [bgc, setBgc] = useState("Amber");


    useEffect(() => {
        var random= Random(0,colors.length);
        setIndex(random);
        setBgc(colors[random] )
        console.log(bgc);
    }, [index])  

    return <div style={{backgroundColor:bgc}}>
        <h1> 功能还在开放中 </h1>
        <h1> 敬请期待 </h1>
        <h1> ...... </h1>

    </div>;
}

export default function ToBeContinue() {
    return ( colors.map((c,index)=>{
        return <Test key={index}/>
    }))
}
