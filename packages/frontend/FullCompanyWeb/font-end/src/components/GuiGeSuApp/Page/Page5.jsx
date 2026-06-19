import React from 'react'
import styles from "./Page.module.css";
import Notes from './SmallComponents/Notes';
import FanImg from "../public/风扇线框图.png";


export default function Page4() {
    return (
        <div className={styles.flexContainer}>
            <Notes />
            <img src={FanImg} alt="风扇线框图"/>
        </div>
    )
}
