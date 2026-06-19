import {useContext } from "react";
import {ModelContext} from '../context/ModelContext';


const  useModel=()=>{
    return useContext(ModelContext);
}


export {useModel };
