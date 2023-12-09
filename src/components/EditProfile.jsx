import React, { useEffect, useState } from 'react'
import Placeholder from '../public/pfp placeholder.jpg'
import { useDispatch, useSelector } from 'react-redux'
import { updateUser } from '../redux/userSlice'
import axios from 'axios'
import { useMutation } from 'react-query'
import { TbCameraPlus } from "react-icons/tb";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import app from '../firebase'
import { useNavigate } from 'react-router-dom'

const EditProfile = () => {
    
  const currentUser = useSelector(state => state.user.currentUser)
  console.log(currentUser)
  const dispatch = useDispatch()
  const [username, setUsername] = useState(currentUser.username)
  const [description, setDescription] = useState(currentUser.description)
  const [profilePicture, setProfilePicture] = useState(currentUser.profilePicture || Placeholder)
  const [coverPhoto, setCoverPhoto] = useState(currentUser.coverPhoto || 'https://www.peacemakersnetwork.org/wp-content/uploads/2019/09/placeholder.jpg')
  const [image, setImage] = useState()
  const [image2, setImage2] = useState()
  const [errorType, setErrorType] = useState()
  const navigate = useNavigate()
  
  const storage = getStorage(app);

  const metadata = {
    contentType: 'image/*'
  };
  
  const uploadImage = (image, imageType) => {
    const storageRef = ref(storage, 'images/' + image.name);
    const uploadTask = uploadBytesResumable(storageRef, image, metadata);
  
    uploadTask.on('state_changed',
      (snapshot) => {
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
          imageType === 'profile' ? setProfilePicture(downloadURL) : setCoverPhoto(downloadURL)
        });
      }
    );  
  }

  useEffect(() => {
    image && uploadImage(image, 'profile')
  },[image])

  useEffect(() => {
    image2 && uploadImage(image2, 'cover')
  },[image2])
  
  const updateData = async () => {
    try {
      setErrorType(null)
      const res = await axios.put(`https://social-sphere-server.onrender.com/api/users/${currentUser._id}`, { username, description, profilePicture, coverPhoto }, { withCredentials: true })
      dispatch(updateUser(res.data))
    } catch (error) {
      console.error(error)
      setErrorType(error.response.data)
    } finally {
      navigate("..", { relative: "path" });
    }
  }

  const updateDataMutation = useMutation(updateData)
  
  return (
      <div className='md:ml-[20%] relative z-10 justify-center md:border-x border-primaryGray w-full h-fit min-h-full bg-black'>
              
        <div className='relative'>
          
          <div className='relative grid place-items-center aspect-[8/3] md:aspect-[4/1]'>
            <img src={coverPhoto} className='absolute z-0 object-cover w-full h-full brightness-90'></img>
            <label htmlFor='cover' className='z-10 cursor-pointer'><TbCameraPlus className='text-2xl md:text-3xl cusror-pointer'/></label>
            <input type='file' id='cover' accept='image/*' onChange={(e) => setImage2(e.target.files[0])}  className='hidden'></input>
          </div>
          
          <div className='absolute bottom-0 grid w-24 h-24 translate-y-1/2 rounded-full left-4 md:left-8 place-items-center md:h-32 md:w-32'>
            <img src={profilePicture} className='absolute z-0 object-cover w-24 h-24 rounded-full md:h-32 md:w-32 brightness-90'></img>
            <label htmlFor='profile' className='z-10 cursor-pointer'><TbCameraPlus className='text-2xl md:text-3xl'/></label>
            <input type='file' id='profile' accept='image/*' onChange={(e) => setImage(e.target.files[0])} className='hidden'></input>
          </div>
          
        </div>
        
        <div className='relative'>
            <button className='absolute px-6 py-1 rounded-full bg-secondaryBlue w-fit right-4 top-4 focus:bg-transparent focus:border focus:border-secondaryBlue' onClick={() => updateDataMutation.mutate()}>Save Changes</button>
        </div>

        
        <div className='px-10 mt-20'>
            {errorType && <p className='py-2 text-red-500'>{errorType}</p>}
            <p className='mb-4'>Username</p>
            <input maxLength={13} onChange={(e) => setUsername(e.target.value)} className='w-full p-2 bg-transparent border-2 rounded-lg outline-none border-primaryBlue' defaultValue={currentUser.username}></input> 
        </div>

        <div className='px-10 mt-6'>
            <p className='mb-4'>Description</p>
            <textarea onChange={(e) => setDescription(e.target.value)} className='w-full p-2 bg-transparent border-2 rounded-lg outline-none resize-none h-52 md:h-32 border-primaryBlue placeholder:text-white' defaultValue={currentUser.description}></textarea> 
        </div>
      
    </div>
  )
}

export default EditProfile