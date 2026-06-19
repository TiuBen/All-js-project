import React from "react";
import "./WorkerInformation.scss";

export default function WorkerInformationShow(props) {
    console.log(props);
    const { avatar, name, phone } = props;

    return (
        <div className="flex-col worker-information-container shower">
            <section className="main-information-section"  >
                <img className="worker-avatar" src={avatar} />
                <div className="main-information" >
                    <label className="worker-name">{name}</label>
                    <label className="phone">{phone}</label>
                    <label className="job">工程师</label>
                </div>
            </section>
            <section className="detail-information-section">
                <div>
                    <label>工作时长 <span>今日是否到岗位</span> </label>
                </div>
                <div>
                    销售业绩 <span>$$$</span>
                </div>
                <div>
                    手头工作 <span>...</span>
                </div>
                <div>
                    手头工作 <span>...</span>
                </div>
            </section>
        </div>
    );
}


// style={{backgroundImage:`url(${avatar})`}}>