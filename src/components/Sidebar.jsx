import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { GoHome, GoSearch, GoPerson, GoSignOut, GoBell } from "react-icons/go";
import { useDispatch, useSelector } from 'react-redux';
import { logoutStart, logoutComplete, updateToken, updateAreNotifsRead } from '../redux/userSlice';
import Logo from '../public/logo.png'

const Sidebar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector(state => state.user.currentUser)
  const areNotifsRead = useSelector(state => state.user.areNotifsRead)

  console.log(areNotifsRead)
  
  const handleLogout = () => {
    dispatch(logoutStart())
    setTimeout(() => {
      const removeToken = () => {
        dispatch(logoutComplete())
        localStorage.removeItem('access_token')
        dispatch(updateToken(null))
        navigate('/')
      }
      removeToken()
    }, 2000)
  }
  
  return (
    <aside className='fixed bottom-0 z-10 flex items-center justify-between w-full break-all h-16 gap-4 px-6 text-black bg-white md:text-white md:bg-primaryBlack md:py-2 md:left-0 md:h-full md:w-[20%] lg:items-start md:justify-start md:mx-auto md:flex-col xl:px-8'>

            <div className='items-center hidden lg:flex'>
              <img src={Logo} height={70} width={70} className='-ml-1'/>
              <span className='text-[0.7rem] hidden lg:block'>by Jawad</span>
            </div>

            <Link to={'/'} className='flex items-center gap-3 p-2 rounded-full cursor-pointer hover:bg-hoverColor w-fit'>
                <GoHome className='text-xl md:text-3xl'/>
                <p className='hidden lg:block'>Home</p>
            </Link>

            <Link to={`/profile/${currentUser._id}`} className='flex items-center gap-3 p-2 rounded-full cursor-pointer hover:bg-hoverColor w-fit'>
                <GoPerson className='text-xl md:text-3xl'/>
                <p className='hidden lg:block'>Profile</p>
            </Link>

            <Link to={`/explore`} className='flex items-center gap-3 p-2 rounded-full cursor-pointer hover:bg-hoverColor w-fit'>
                <GoSearch className='text-xl md:text-3xl'/>
                <p className='hidden lg:block'>Explore</p>
            </Link>

            <Link to={`/notifications`} onClick={() => dispatch(updateAreNotifsRead(true))} className='flex items-center gap-3 p-2 rounded-full cursor-pointer hover:bg-hoverColor'>
              <div className='relative'>
                <GoBell className='text-xl md:text-3xl'/>
                {areNotifsRead === false && <span className='absolute top-0 right-0 w-2 h-2 translate-x-1/2 -translate-y-1/2 rounded-full bg-secondaryBlue'></span>}
              </div>
              <p className='hidden lg:block'>Notifications</p>
            </Link>

            <button onClick={() => handleLogout()} className='flex items-center gap-3 p-2 rounded-full cursor-pointer hover:bg-hoverColor w-fit'>
                <GoSignOut className='text-xl text-red-500 md:text-3xl'/>
                <p className='hidden lg:block'>Logout</p>
            </button>
                        
    </aside>
  )
}

export default Sidebar