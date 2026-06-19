import React, { useState, useEffect ,useContext} from "react";
import PlanCard from './PlanCard';
import {users} from '../../data/index';


export default function PersonalPlanList(props) {
    return (
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
            {   
                users.map((user,index) => {
                    return <PlanCard key={index} name={user.name}/>              
                })
            }
        </div>
    );
}



