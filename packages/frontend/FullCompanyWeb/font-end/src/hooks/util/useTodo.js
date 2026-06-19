import {useState,useEffect,useContext} from "react";
import {mockTodo} from '../../data/index.js';

function useTodo(){
    const [todoList, setTodoList] = useState([]);

    const promise=new Promise((resolve,reject)=>{
        setTimeout(() => {
            resolve(mockTodo())
        }, 1000);
    });

    useEffect(() => {
       promise.then(value=>
           console.log(value)
       )
     
    }, [])


    return todoList
}


//









export {useTodo}
