import React from 'react';
import MessageOutlinedIcon from '@mui/icons-material/MessageOutlined';
import { IoIosHeartEmpty, IoIosHeart } from 'react-icons/io';
import { IoTrashOutline } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Placeholder from '../public/pfp placeholder.jpg';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import formatDistance from 'date-fns/formatDistance'

const Tweet = ({ tweet, tweetsType, id, show }) => {
    const currentUser = useSelector((state) => state.user.currentUser);
    const navigate = useNavigate();

    const queryClient = useQueryClient()

    const findTweetUser = async () => {
        try {
            const res = await axios.get(`https://social-sphere-server.onrender.com/api/users/${tweet.userId}`);
            return res.data;
        } catch (error) {
            console.error('Error finding tweet user:', error);
        }
    };

    const findNumberOfComments = async () => {
        try {
            const res = await axios.get(`https://social-sphere-server.onrender.com/api/comment/tweet/${tweet._id}`);
            return res.data.length;
        } catch (error) {
            console.error(error);
        }
    };

    const handleLikeToggle = async () => {
        try {
            queryClient.setQueryData(['tweets', tweetsType], prev => {
                return prev && prev.map(prevTweet =>
                    prevTweet._id === tweet._id
                        ? {
                              ...prevTweet,
                              likes: tweet.likes.includes(currentUser._id)
                                  ? tweet.likes.filter((id) => id !== currentUser._id)
                                  : [...tweet.likes, currentUser._id],
                          }
                        : prevTweet
                );
            });

            await axios.put(`https://social-sphere-server.onrender.com/api/tweet/likeOrUnlike/${tweet._id}`, {
                id: currentUser._id,
            });
            await queryClient.invalidateQueries(['tweets', tweetsType]);
            await queryClient.invalidateQueries(['userActivity', id, show])
            await queryClient.invalidateQueries(['tweet', id])
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteTweet = async () => {
        try {
            queryClient.setQueryData(['tweets', tweetsType], prev => {
                return prev && prev.filter(prevTweet => prevTweet._id !== tweet._id )
            })
            
            await axios.delete(`https://social-sphere-server.onrender.com/api/tweet/delete/${tweet._id}`, {
                withCredentials: true,
            });
            
            queryClient.invalidateQueries(['tweets', tweetsType]);
        } catch (error) {
            console.error(error);
        }
    };

    const { data: tweetUser } = useQuery(['tweetUser', tweet._id], findTweetUser);
    const { data: numberOfComments } = useQuery(['numberOfComments', tweet._id], findNumberOfComments);

    const LikeToggleMutaion = useMutation(handleLikeToggle);
    const deleteTweetMutation = useMutation(handleDeleteTweet);

    const datePosted = formatDistance(new Date(tweet.createdAt), new Date())

    return (
        <article key={tweet._id} id='tweet' className='flex w-full gap-3 p-3 border-b border-primaryGray last-of-type:mb-16 md:last-of-type:mb-0 hover:bg-hoverColor'>
            <Link to={`/profile/${tweet.userId}`} className='relative w-12 h-12 rounded-full grow-0 shrink-0'>
                <img src={tweetUser?.profilePicture || Placeholder} className='absolute z-0 object-cover w-12 h-12 rounded-full'></img>
            </Link>
            <div className='w-full pr-4 text-sm'>
                <div className='relative flex justify-between w-full'>
                    <Link to={`/profile/${tweet.userId}`} className='w-full text-sm text-primaryBlue'>@{tweetUser && tweetUser.username}</Link>
                    <p className='absolute right-0 text-primaryBlue text-[0.7rem]'>{datePosted.replace('about', '').replace('less than a minute', '1 minute')} ago</p>
                </div>
                <p onClick={() => navigate(`/tweet/${tweet._id}`)} className='w-full mt-1 break-all'>
                    {tweet.text}
                </p>
                {tweet && tweet.image && <img src={tweet.image} onClick={() => navigate(`/tweet/${tweet._id}`)} className='object-cover w-full mt-4 rounded-md'></img>}
                <div className='flex items-center gap-1 mt-4'>
                    {tweet.likes.includes(currentUser._id) ? (
                    <IoIosHeart className='text-lg text-red-500 cursor-pointer' onClick={() => LikeToggleMutaion.mutate()} />
                    ) : (
                    <IoIosHeartEmpty className='text-lg cursor-pointer' onClick={() => LikeToggleMutaion.mutate()} />
                    )}
                    <p>{tweet.likes.length}</p>
                    <MessageOutlinedIcon onClick={() => navigate(`/tweet/${tweet._id}`)} className='ml-2 -mb-0.5 cursor-pointer' sx={{ fontSize: 20 }} />
                    <p>{numberOfComments}</p>
                    {tweet.userId === currentUser._id && (
                    <IoTrashOutline onClick={() => deleteTweetMutation.mutate()} className='ml-2 text-base cursor-pointer' />
                    )}
                </div>
            </div>
      </article>
    );
};

export default Tweet;