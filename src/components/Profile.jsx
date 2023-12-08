import React from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import Placeholder from '../public/pfp placeholder.jpg'
import axios from 'axios'
import { useSelector } from 'react-redux'
import Tweet from './Tweet'
import Comment from './Comment'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from 'react-query'

const Profile = () => {

  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const show = searchParams.get('show') || 'posts'
  const currentUser = useSelector(state => state.user.currentUser)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const findUser = async () => {
    try {
      const res = await axios.get(`https://social-sphere-server.onrender.com/api/users/${id}`)
      return res.data
    } catch (error) {
      console.error(error)
    }
  }

  const findUserActivity = async () => {
    try {
      const res = 
      show === 'posts' ? 
      await axios.get(`https://social-sphere-server.onrender.com/api/tweet/userTweets/${id}`, { withCredentials: true }) :
      show === 'comments' ? 
      await axios.get(`https://social-sphere-server.onrender.com/api/comment/user/${id}`, { withCredentials: true }) :
      show === 'likes' ?
      await axios.get(`https://social-sphere-server.onrender.com/api/users/likes/${id}`, { withCredentials: true }) :
      Promise.reject(new Error('Page not found'))
      
      return res.data
    } catch (error) {
      console.error(error)
    }
  }

  const {data: profileUser} = useQuery(['profileUser', id], findUser)
  const {data: userActivity} = useQuery(['userActivity', id, show], findUserActivity)
  
  const followOrUnfollow = async () => {
    try {
      queryClient.setQueryData(['profileUser', id], prev => {
        if (prev.followers.includes(currentUser._id)) {
          return {
            ...prev,
            followers: prev.followers.filter(id => id !== currentUser._id)
          };
        } else {
          return {
            ...prev,
            followers: [...prev.followers, currentUser._id]
          };
        }
      });
  
      await axios.put(`https://social-sphere-server.onrender.com/api/users/followOrUnfollow/${profileUser && profileUser._id}`, { id: currentUser._id }, { withCredentials: true });
  
      queryClient.invalidateQueries(['profileUser', id]);
    } catch (error) {
      console.error(error);
    }
  };
  
  
  const followOrUnfollowMutation = useMutation(followOrUnfollow)
  
  return (
    <section className='md:ml-[20%] w-full md:pb-0 min-h-full h-fit md:border-x border-primaryGray relative'>
      
      {/* cover photo and profile picture */}
      <div className='relative'>
          <div className='relative aspect-[8/3] md:aspect-[4/1] grow-0 shrink-0'>
            <img src={profileUser?.coverPhoto || 'https://www.peacemakersnetwork.org/wp-content/uploads/2019/09/placeholder.jpg'} className='absolute object-cover w-full h-full'></img>
          </div>
          <div className='absolute bottom-0 grid w-24 h-24 translate-y-1/2 rounded-full left-4 md:left-8 place-items-center md:h-32 md:w-32'>
            <img src={profileUser?.profilePicture || Placeholder } className='absolute z-0 object-cover w-24 h-24 rounded-full md:h-32 md:w-32'></img>
          </div>
      </div>

      {/* if the profile is for the logged in user, dont show follow button */}
      {profileUser && profileUser._id !== currentUser._id && (
          <div className='relative'>
              {profileUser && profileUser.followers.includes(currentUser._id) ?
               <button className='absolute px-6 py-1 bg-transparent border rounded-full border-secondaryBlue w-fit right-4 top-4' onClick={() => followOrUnfollowMutation.mutate()}>Following</button>
               :
               <button className='absolute px-6 py-1 rounded-full bg-secondaryBlue w-fit right-4 top-4' onClick={() => followOrUnfollowMutation.mutate()}>Follow</button>
               }
              
          </div>
      )}
      
      {/* show edit profile if the profile is for the logged in user */}
      {profileUser && profileUser._id === currentUser._id && (
          <div className='relative w-full'>
            <button onClick={() => navigate('./edit', { relative: 'path' })} className='absolute px-6 py-1 bg-transparent border rounded-full right-4 top-4 border-secondaryBlue w-fit'>Edit Profile</button>
          </div>
      )}

      {/* profile information */}
      <div className={`space-y-2 border-b border-primaryGray pt-16 px-6 md:pt-20 md:px-12`}>
        <h2>@{profileUser && profileUser.username}</h2>
        
        <div className='flex gap-3'>
          <div className='flex items-center gap-1'>
            <p>{profileUser && profileUser.following.length}</p>
            <Link to={'following'}>Following</Link>
          </div>
          
          <div className='flex items-center gap-1'>
            <p>{profileUser && profileUser.followers.length}</p>
            <Link to={'followers'}>Followers</Link>
          </div>
        </div>
        
        <div className='w-full'>{profileUser && profileUser.description}</div>
        
        <div className='flex justify-between pt-2 md:justify-around'>
          <button onClick={() => setSearchParams('?show=posts')} className={`pb-1 border-b-4 ${show === 'posts' ? 'border-secondaryBlue' : 'border-transparent'}`}>Posts</button>
          <button onClick={() => setSearchParams('?show=comments')} className={`pb-1 border-b-4 ${show === 'comments' ? 'border-secondaryBlue' : 'border-transparent'}`}>Replies</button>
          <button onClick={() => setSearchParams('?show=likes')} className={`pb-1 border-b-4 ${show === 'likes' ? 'border-secondaryBlue' : 'border-transparent'}`}>Likes</button>
        </div>
      </div>

      {show === 'posts' && userActivity && userActivity.map(tweet => (
        <Tweet tweet={tweet} tweetsType={'global'} id={id} show={show} key={tweet._id}/>
      ))}

      {show === 'comments' && userActivity && userActivity.map(comment => (
        <Comment comment={comment} key={comment._id}/>
      ))}

      {show === 'likes' && userActivity && userActivity.map(tweet => (
        <Tweet tweet={tweet} key={tweet._id}/>
      ))}
      
    </section>
  )
}

export default Profile