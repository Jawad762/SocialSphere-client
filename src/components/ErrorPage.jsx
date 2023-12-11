import React from 'react'
import logo from '../public/logo.png'

const ErrorPage = () => {
  return (
    <section className='flex flex-col items-center justify-center w-screen h-screen gap-4'>
        <img src={logo} className='-mt-24'></img>
        <p className='-mt-24 text-xl text-center sm:text-2xl'>Page could not be found</p>
    </section>
  )
}

export default ErrorPage