import axios from 'axios'
import React from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import Placeholder from '../public/pfp placeholder.jpg'

const Notification = ({ notification }) => {

    const findNotificationSource = async () => {
        const res = await axios.get(`https://social-sphere-server.onrender.com/api/users/${notification.sourceId}`)
        return res.data
    }

    const { data: notificationSource } = useQuery(['notificationSource', notification.sourceId], findNotificationSource)

  return (
    <Link to={notification.type === 'follow' ? `/profile/${notification.sourceId}` : `/tweet/${notification.tweetId}`} className='flex items-center gap-3 p-2 rounded-full cursor-pointer hover:bg-hoverColor'>
        <div className='relative rounded-full w-14 h-14 grow-0 shrink-0'>
            <img className='absolute object-cover rounded-full w-14 h-14' src={notificationSource?.profilePicture || Placeholder}/>
        </div>
        <p className=''>{notification.value}</p>
    </Link>
  )
}

export default Notification