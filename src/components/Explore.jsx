import React, { useState } from 'react'
import { GoSearch } from "react-icons/go";
import { useSearchParams, useNavigate } from 'react-router-dom';
import Placeholder from '../public/pfp placeholder.jpg'
import axios from 'axios';

const Explore = () => {

    const [searchParams, setSearchParams] = useSearchParams()
    const searchValue = searchParams.get('search') || ''
    const [users, setUsers] = useState([])
    const navigate = useNavigate()

    const handleSearch = async (e) => {
        e.preventDefault()
        try {
            const res = await axios.get(`https://social-sphere-server.onrender.com/api/users/search/${searchValue}`)
            setUsers(res.data)
        } catch (error) {
            console.error(error)
        }
    }
    
  return (
    <section className='w-full h-fit min-h-full md:ml-[20%] md:border-x border-primaryGray'>
        <form onSubmit={handleSearch} className='relative flex items-center gap-2 px-4 py-2 mx-10 my-4 rounded-full bg-secondaryBlue'>
            <input onChange={(e) => setSearchParams(`?search=${e.target.value}`)} value={searchValue} name='search' className='w-full pr-4 bg-transparent outline-none placeholder:text-white' placeholder='Search'></input>
            <button type='submit' className='absolute right-0 p-2 translate-x-1/2 rounded-full bg-primaryBlack'><GoSearch className='text-xl'/></button>
        </form>
        
        <div className='py-2 space-y-4'>
            {users.map(user => (
                <div onClick={() => navigate(`/profile/${user._id}`)} key={user._id} className='flex items-center gap-2 mx-10 rounded-full cursor-pointer hover:bg-hoverColor'>
                    <div className='relative rounded-full h-14 w-14 grow-0 shrink-0'>
                        <img className='absolute z-0 object-cover rounded-full w-14 h-14' src={user.profilePicture || Placeholder}></img>
                    </div>
                    <p>{user.username}</p>
                </div>
            ))}
        </div>
        
    </section>
  )
}

export default Explore