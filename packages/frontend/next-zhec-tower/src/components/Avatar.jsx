"use client";
import React from "react";

  function Avatar(props) {
    const { shape="circle" } = props;

    const {
        src = "https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?&w=64&h=64&dpr=2&q=70&crop=focalpoint&fp-x=0.67&fp-y=0.5&fp-z=1.4&fit=crop",
    } = props;

    return <img className={`w-[2rem] h-[2rem] aspect-square ${shape==='circle'?"rounded-full":""} `} src={src} />;
}

module.exports={Avatar}

