import React from 'react'

function Countdown() {
  return (
    <div className='mx-auto flex flex-col items-center justify-center gap-2 py-2 text-3xl font-bold'>
        <h3>剩余时间</h3>
        <h3 className='text-red-500'>00分00秒</h3>
    </div>
  )
}

export default Countdown