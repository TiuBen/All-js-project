import React from 'react'
import { Button } from '@radix-ui/themes'

function Info() {
  return (
    <div className='p-4 flex flex-col gap-2 w-[240px]'>
      <div>姓名
            :{}
      </div>
      <div className='flex flex-row flex-wrap'>准考证号
            :{}
      </div>
      <div>
         <Button>提交</Button>   
      </div>
    </div>
  )
}

export default Info