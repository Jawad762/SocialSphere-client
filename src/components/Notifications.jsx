import React from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { useQuery } from 'react-query'
import Notification from './Notification'


const Notifications = () => {

  const currentUser = useSelector(state => state.user.currentUser)
  
  const getUserNotifications = async () => {
    const res = await axios.get(`https://social-sphere-server.onrender.com/api/notification/${currentUser._id}`)
    return res.data
  }

  const { data: notifications } = useQuery('notifications', getUserNotifications)

  console.log(notifications)
  
  return (
    <section className='w-full min-h-full h-fit md:border-x md:ml-[20%] border-primaryGray pb-16 md:pb-0'>
      <h2 className='pt-4 pb-2 mx-6 mb-6 text-xl border-b md:mx-10 border-primaryGray'>Notifications</h2>
      <div className='mx-4 space-y-4 md:mx-8'>
        {notifications?.map(notification => (
          <Notification notification={notification} key={notification._id}/>
        ))}
      </div>
    </section>
  )
}

export default Notifications