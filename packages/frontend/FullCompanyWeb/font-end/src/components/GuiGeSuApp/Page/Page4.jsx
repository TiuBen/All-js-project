import React from 'react'
import styles from "./Page.module.css";
import NoiseTest from './SmallComponents/NoiseTest';
import ReliabilityTest from './SmallComponents/ReliabilityTest';



export default function Page4() {
    return (
        <div className={styles.flexContainer}>
            
            <NoiseTest />
            <ReliabilityTest />
        </div>
    )
}
