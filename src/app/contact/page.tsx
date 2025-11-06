import Image from 'next/image'
import React from 'react'

function page() {
  return (
    <div className='flex flex-col gap-15 justify-center items-center h-screen'>
        <h1 className='font-extrabold text-3xl'>Contact Page</h1>
        <Image src="/images/meme.gif" alt="Contact Us" width={600} height={400} />
    </div>
  )
}

export default page