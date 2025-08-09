import React from 'react'

const Navbar = () => {
  return (
    <div className='flex justify-between items-center lg:rounded bg-black p-4 mx-2 my-2'>
      <div className='hidden md:flex'>
        <h1 className='text-1xl font-bold text-white '>Plant Disease Detection</h1>
      </div>
    </div>
  )
}

export default Navbar
