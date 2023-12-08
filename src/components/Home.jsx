import React, { useRef, lazy, Suspense, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Logo from '../public/logo.png'
import Placeholder from '../public/pfp placeholder.jpg'
import BlurredTweet from './BlurredTweet';
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useSearchParams } from 'react-router-dom';
import { TextareaAutosize } from '@mui/material';
import { FaPen, FaRegImage } from 'react-icons/fa6';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import app from '../firebase';

const LazyTweet = lazy(() => import('./Tweet'))

const Home = () => {
  const currentUser = useSelector(state => state.user.currentUser);
  const loadingValue = useSelector(state => state.user.isLogoutLoading)
  const [searchParams, setSearchParams] = useSearchParams()
  const tweetsType = searchParams.get('feed') || 'global'
  const formRef = useRef()
  const queryClient = useQueryClient()
  const [currentImage, setCurrentImage] = useState()
  const [postImage, setPostImage] = useState()
  const [IsImageLoading, setIsImageLoading] = useState(false)

    const storage = getStorage(app)

    const metadata = {
      contentType: 'image/*'
    };

    const uploadImage = (file) => {
      const storageRef = ref(storage, 'posts-images/' + file.name);
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          setIsImageLoading(true);
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
        async () => {
          try {
            // Resize image before getting download URL
            const resizedImageBlob = await resizeImage(file);
            const resizedImageFile = new File([resizedImageBlob], file.name, { type: file.type });
    
            const resizedStorageRef = ref(storage, 'resized-images/' + file.name);
            const resizedUploadTask = uploadBytesResumable(resizedStorageRef, resizedImageFile, metadata);
    
            resizedUploadTask.on(
              'state_changed',
              (resizedSnapshot) => {
                // Handle resize upload progress if needed
              },
              (resizedError) => {
                // Handle resize upload error if needed
              },
              () => {
                // Get download URL for the resized image
                getDownloadURL(resizedUploadTask.snapshot.ref).then((resizedDownloadURL) => {
                  setIsImageLoading(false);
                  setPostImage(resizedDownloadURL);
                });
              }
            );
          } catch (resizeError) {
            console.error('Error resizing image:', resizeError);
          }
        }
      );
    };
    
    const resizeImage = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const maxWidth = 800;
            const maxHeight = 800;
            let width = img.width;
            let height = img.height;
    
            if (width > height) {
              if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
              }
            }
    
            canvas.width = width;
            canvas.height = height;
    
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
              resolve(blob);
            }, file.type);
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      });
    };

    useEffect(() => {
      currentImage && uploadImage(currentImage)
    }, [currentImage])

  const getTweets = async () => {
    try {
      const res = 
        tweetsType === 'global' ? await axios.get(`https://social-sphere-server.onrender.com/api/tweet/all`) 
        : tweetsType === 'following' ? await axios.get(`https://social-sphere-server.onrender.com/api/tweet/timeline/${currentUser._id}`, { withCredentials: true })
        : Promise.reject(new Error('Page not found'))
        
      return res.data;
    } catch (error) {
      throw new Error('Error fetching explore tweets');
    }
  }
  
  const createTweet = async (data) => {
    try {
      await axios.post('https://social-sphere-server.onrender.com/api/tweet/create', data, { withCredentials: true });
    } catch (error) {
      console.error('Error creating tweet:', error);
    }
  };


  const { data: tweets } = useQuery(['tweets', tweetsType], getTweets)
  
  const createTweetMutation = useMutation(createTweet, {
    onSuccess: () => {
      queryClient.invalidateQueries('tweets')
      setPostImage(null)
    }
  })

  const handleCreateTweet = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const text = form.get('text');
    if (text.length > 0 || currentImage) createTweetMutation.mutate({ userId: currentUser._id, text, image: postImage})
    else return
    formRef.current.reset()
  };

  return (
    <section className='w-full flex flex-col items-center pb-16 md:pb-0 min-h-full h-fit md:ml-[20%] md:border-x border-primaryGray'>

        {/* logo area for smaller screens */}
        <div className='flex items-center w-full border-b border-primaryGray md:hidden'>
             <img src={Logo} height={70} width={70} className='mx-auto'/>
        </div>
        
        <div className='relative flex w-full text-sm border-white'>
              <button className='w-full py-2 mx-auto' onClick={() => setSearchParams('?feed=global')}>Global</button>
              <button className='w-full py-2 mx-auto text-slate-400' onClick={() => setSearchParams('?feed=following')}>Following</button> 
              <div className={`absolute bottom-0 h-0.5 w-1/2 bg-primaryBlue transition-all ${tweetsType === 'following' ? 'left-1/2' : 'left-0'}`}></div> 
        </div>
            
        <form onSubmit={handleCreateTweet} ref={formRef} className='flex items-center w-full gap-4 p-3 py-4 text-sm border-b border-primaryGray md:p-4 '>
            <div className='relative w-16 h-16 mb-auto rounded-full grow-0 shrink-0'>
              <img src={currentUser.profilePicture || Placeholder } className='absolute z-0 object-cover w-16 h-16 rounded-full'></img>
            </div>
            <div className='w-full pr-4 space-y-2'>
              <div>
                <TextareaAutosize type='text' name='text' minRows={1} maxRows={5}  maxLength={400} className='w-full h-10 bg-transparent outline-none resize-none' placeholder={currentUser && currentUser.username ? `${currentUser.username}, what's happening ?!` : "What's happening ?!"}></TextareaAutosize>
                {postImage && <img src={postImage} className='object-cover w-full my-2 rounded-md'></img>}
                {IsImageLoading && 
                          (
                            <svg aria-hidden="true" className="mx-auto mt-3 text-white w-7 h-7 animate-spin fill-primaryBlue" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                            </svg> 
                          )
                        }
              </div>
              <div className='flex items-center gap-2'>
                <FaPen className='cursor-pointer'/>
                <label className='cursor-pointer' htmlFor='comment-image'><FaRegImage/></label>
                <input type='file' name='comment-image' id='comment-image' onChange={(e) => setCurrentImage(e.target.files[0])} className='hidden'></input>
                <button type='submit' className='px-4 py-1 ml-auto bg-secondaryBlue rounded-2xl w-fit '>Post</button>
              </div>
            </div>
        </form>
            
        {loadingValue ? 
        <svg aria-hidden="true" className="mx-auto text-white w-7 h-7 mt-7 animate-spin fill-primaryBlue" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        :
        tweets && tweets.sort((a, b) => b.createdAt - a.createdAt).map(tweet => (
            <Suspense key={tweet._id} fallback={<BlurredTweet/>}>         
              <LazyTweet tweet={tweet} tweetsType={tweetsType}/>
            </Suspense>
        ))}
        
    </section>
  );
};

export default Home;

