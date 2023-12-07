import React from 'react'
import Placeholder from '../public/pfp placeholder.jpg'

const BlurredTweet = () => {
  return (
    <article  className='flex w-full gap-3 p-3 border-b border-primaryGray last-of-type:mb-16 md:last-of-type:mb-0'>
        <img src={Placeholder} className='w-12 h-12 -mt-2'></img>
        <div className='w-full gap-2 text-sm'>
            <p className='w-16 h-1 bg-primaryGray'></p>
            <p className='w-full h-1 mt-2 bg-primaryGray'></p>
            <p className='w-full h-1 bg-primaryGray'></p>
            <p className='w-full h-1 bg-primaryGray'></p>
        </div>
    </article> 
  )
}

export default BlurredTweet