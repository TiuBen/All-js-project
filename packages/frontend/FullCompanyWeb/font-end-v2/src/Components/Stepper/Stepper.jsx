import React from 'react'
import './Stepper.css'

function Stepper({status,content}) {
  return (
    <div className='stepper-container' style={{display:"flex",flexDirection:"column",flex:1}}>
        <div  className='stepper-status'>{status||"状态"}</div>
        <span className='stepper-line' ></span>
        <div className='stepper-content'>{content||"内容"}</div>

    </div>
  )
}

export  {Stepper}