import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Placeholder from '../public/pfp placeholder.jpg'
import axios from 'axios'
import { useQuery } from 'react-query'

const ViewUserFollows = () => {
    const { id, info } = useParams()
    const navigate = useNavigate()
    
    const getUserFollows = async () => {
        try {
            const res = 
             info === 'followers' ?
             await axios.get(`https://social-sphere-server.onrender.com/api/users/followers/${id}`) :
             info === 'following' ?
             await axios.get(`https://social-sphere-server.onrender.com/api/users/following/${id}`) : Promise.reject(new Error('Page not found'));
             
             return res.data
        } catch (error) {
            console.error(error)
        }
    }

    const { data: follows } = useQuery(['follows', id], getUserFollows)

  return (
    <section className='md:ml-[20%] h-fit min-h-full space-y-6 w-full md:border-x border-primaryGray p-5 mb-16 md:mb-0'>
        <h2 className='pb-2 mb-6 ml-2 text-xl capitalize border-b border-primaryGray'>{info}</h2>
        {follows && follows.map(user => (
            <div onClick={() => navigate(`/profile/${user._id}`)} key={user._id} className='flex items-center w-full gap-3 rounded-full cursor-pointer hover:bg-hoverColor'>
                <div className='relative rounded-full h-14 w-14 grow-0 shrink-0'>
                    <img className='absolute z-0 object-cover rounded-full w-14 h-14' src={user.profilePicture || Placeholder}></img>
                </div>
                <p>{user.username}</p>
            </div>
        ))}
    </section>
  )
}

export default ViewUserFollows