import axios from 'axios'
import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Placeholder from '../public/pfp placeholder.jpg'
import { IoIosHeartEmpty, IoIosHeart } from "react-icons/io";
import { IoTrashOutline } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useParams } from 'react-router-dom'
import formatDistance from 'date-fns/formatDistance'


const Comment = ({ comment, userId, show }) => {
    
    const { id } = useParams();
    const currentUser = useSelector(state => state.user.currentUser)
    const queryClient = useQueryClient()
    const datePosted = formatDistance(new Date(comment.createdAt), new Date())
    
    const getCommentUser = async () => {
        try {
            const res = await axios.get(`https://social-sphere-server.onrender.com/api/users/${comment.userId}`)
            return res.data
        } catch (error) {
            console.error(error)
        }
    }

    const handleDeleteComment = async () => {
        try {
            await axios.delete(`https://social-sphere-server.onrender.com/api/comment/delete/${comment._id}`, { withCredentials: true })
            await queryClient.invalidateQueries(['comments', id])
            await queryClient.invalidateQueries(['userActivity', userId , show]);
            queryClient.removeQueries(['tweet'])
        } catch (error) {
            console.error(error)
        }
    }

    const handleLikeToggle = async () => {
        try {
            queryClient.setQueryData(['comments'], prev => {
                return prev && prev.map(prevComment =>
                    prevComment._id === comment._id
                        ? {
                              ...prevComment,
                              likes: comment.likes.includes(currentUser._id)
                                  ? comment.likes.filter((id) => id !== currentUser._id)
                                  : [...comment.likes, currentUser._id],
                          }
                        : prevComment
                );
            });

            await axios.put(`https://social-sphere-server.onrender.com/api/comment/likeOrUnlike/${comment._id}`, { id: currentUser._id });
            await queryClient.invalidateQueries(['comments', id]);
            await queryClient.invalidateQueries(['userActivity', userId , show]);
        } catch (error) {
            console.error(error);
        }
    }

  const { data: commentUser } = useQuery(['commentUser', comment._id], getCommentUser)
  const likeToggleMutation = useMutation(handleLikeToggle)
  const deleteCommentMutation = useMutation(handleDeleteComment)
  
  return (
    <article key={comment._id} id='comment' className='flex w-full gap-3 p-3 last-of-type:mb-16 md:last-of-type:mb-0'>
            <Link to={`/profile/${comment.userId}`} className='relative w-12 h-12 rounded-full grow-0 shrink-0'>
                <img src={commentUser?.profilePicture || Placeholder} className='absolute z-0 object-cover w-12 h-12 rounded-full'></img>
            </Link>
            <div className='relative w-full pr-4 overflow-hidden text-sm'>
                <Link to={`/profile/${comment.userId}`} className='text-sm text-primaryBlue'>@{commentUser && commentUser.username}</Link>
                <span className='absolute right-4 text-[0.7rem] text-primaryBlue'>{datePosted.replace('about', '').replace('less than a minute', '1 minute')} ago</span>
                <p className='mt-1 mb-2 break-all '>{comment.text}</p>
                {comment && comment.image && <img src={comment.image} className='object-cover w-full rounded-md'/>}
                <div className='flex items-center gap-1 mt-4'>
                    {comment.likes.includes(currentUser._id) ? <IoIosHeart className='text-lg text-red-500 cursor-pointer' onClick={() => likeToggleMutation.mutate()}/> : <IoIosHeartEmpty className='text-lg cursor-pointer' onClick={() => likeToggleMutation.mutate()}/> }
                    <p>{comment.likes.length}</p>
                    {comment.userId === currentUser._id && <IoTrashOutline onClick={() => deleteCommentMutation.mutate()} className='ml-2 text-lg cursor-pointer'/> }   
                </div>
            </div>
    </article>
  )
}

export default Comment