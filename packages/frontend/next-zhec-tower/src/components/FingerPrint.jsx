import React from 'react'
import fingerprint from "../../public/fingerprint.svg"
import Image from 'next/image'

function FingerPrint() {
  return (
    <div>

      <Image src={fingerprint} alt="" />
    </div>

  )
}

export default FingerPrint