import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useMutation, useQueryClient } from 'react-query';
import Placeholder from '../public/pfp placeholder.jpg';
import { IoCloseSharp } from "react-icons/io5";
import { FaRegImage, FaPen } from "react-icons/fa6";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import app from '../firebase';
import { TextareaAutosize } from '@mui/base/TextareaAutosize';


const AddCommentForm = ({ tweet, setShowForm }) => {
    const currentUser = useSelector(state => state.user.currentUser)
    const { id } = useParams();
    const formRef = useRef()
    const queryClient = useQueryClient()
    const [currentImage, setCurrentImage] = useState()
    const [commentImage, setCommentImage] = useState()
    const [IsImageLoading, setIsImageLoading] = useState(false)

    const storage = getStorage(app)

    const metadata = {
      contentType: 'image/*'
    };

    const uploadImage = (file) => {
      const storageRef = ref(storage, 'comments-images/' + file.name);
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);
      
      uploadTask.on('state_changed',
        (snapshot) => {
          setIsImageLoading(true)
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
          }
        }, 
        (error) => {
          switch (error.code) {
            case 'storage/unauthorized':
              break;
            case 'storage/canceled':
              break;
            case 'storage/unknown':
              break;
          }
        }, 
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setIsImageLoading(false)
            setCommentImage(downloadURL)
          });
        }
      );
    }

    useEffect(() => {
      currentImage && uploadImage(currentImage)
    }, [currentImage])
    
    const addComment = async (data) => {
        try {
          await axios.post('https://social-sphere-server.onrender.com/api/comment/create', data)
          await queryClient.invalidateQueries(['comments', id])
          await queryClient.invalidateQueries(['tweet', id])
          queryClient.removeQueries(['tweet', id])
        } catch (error) {
          console.error(error)
        }
      }
      
      const addCommentMutation = useMutation(addComment)

      const handleCommentSubmit = (e) => {
        e.preventDefault()
        const form = new FormData(e.currentTarget)
        const text = form.get('comment')
        try {
            addCommentMutation.mutate({ text, tweetId: tweet._id, userId: currentUser._id, image: commentImage })
            formRef.current.reset()
        } catch (error) {
            console.error(error)
        } finally {
            setShowForm(false)
        }
      }
      
  return (
          <form ref={formRef} className='flex flex-col w-full h-fit min-h-full gap-6 p-4 md:border-x md:ml-[20%] border-primaryGray bg-primaryBlack' onSubmit={handleCommentSubmit}>
              <IoCloseSharp onClick={() => setShowForm(false)} className='text-2xl cursor-pointer text-secondaryBlue'>X</IoCloseSharp>
              <div className='flex gap-2'>  
                <div className='relative w-10 h-10 rounded-full grow-0 shrink-0'>
                    <img className='absolute z-0 object-cover w-10 h-10 rounded-full' src={currentUser.profilePicture || Placeholder}></img>
                </div>
                <div className='w-full p-2 space-y-4 h-fit'>
                      <div className='pb-1 border-b'>
                        <TextareaAutosize name='comment' minRows={1} maxRows={5} maxLength={300} className='w-full bg-transparent outline-none resize-none' placeholder={`Add comment...`}></TextareaAutosize>
                        {commentImage && <img src={commentImage} className='object-cover w-full rounded-md'></img>}
                        {IsImageLoading && 
                          (
                            <svg aria-hidden="true" className="mx-auto text-white w-7 h-7 animate-spin fill-primaryBlue" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                            </svg> 
                          )
                        }
                      </div>
                      <div className='flex items-center gap-4'>
                        <FaPen className='cursor-pointer'/>
                        <div>
                          <label className='cursor-pointer' htmlFor='comment-image'><FaRegImage/></label>
                          <input type='file' name='comment-image' id='comment-image' onChange={(e) => setCurrentImage(e.target.files[0])} className='hidden'></input>
                        </div>
                        <button type='submit' className='px-6 py-1 ml-auto rounded-full bg-secondaryBlue'>Reply</button>
                      </div>
                </div>
              </div>
          </form>
  )
}

export default AddCommentForm