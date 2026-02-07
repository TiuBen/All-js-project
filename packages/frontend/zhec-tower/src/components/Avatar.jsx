import React from "react";
import {server} from '../lib/CONST'

export default function Avatar(props) {
    const { shape , username,className } = props;

   
        // src = "https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?&w=64&h=64&dpr=2&q=70&crop=focalpoint&fp-x=0.67&fp-y=0.5&fp-z=1.4&fit=crop",
  

    return (
        <img
            className={`max-w-[80px]  _aspect-square aspect-auto ${shape === "circle" ? "rounded-full" : ""} ${className}`}
            src={server+"/"+username +".jpg"} 
            alt={username}
        />
    );
}
