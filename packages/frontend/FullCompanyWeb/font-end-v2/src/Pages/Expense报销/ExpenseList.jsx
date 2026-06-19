import React,{useEffect} from 'react';
import { useOutletContext } from "react-router-dom";


function ExpenseList() {
  const {aaa,changeRelateTab } = useOutletContext();

  useEffect(() => {
    changeRelateTab(1);
  }, [changeRelateTab])
  

  return (
    <div>ExpenseList</div>
  )
}

export default ExpenseList