import React from 'react'
import PartMaterial from './SmallComponents/PartMaterial'
import PQImage from './SmallComponents/PQImage'
import QualityCertify from './SmallComponents/QualityCertify'
import RefEnvironment from './SmallComponents/RefEnvironment'
import styles from "./Page.module.css";

export default function Page3() {
    return (
        <div className={ styles.flexContainer }>
            <PQImage />
            <PartMaterial />
            <RefEnvironment />
            <QualityCertify />
        </div>
    )
}

