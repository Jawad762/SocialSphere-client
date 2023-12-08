import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'
import { loginStart, loginComplete, loginFail } from '../redux/userSlice';
import axios from 'axios'
import Logo from '../public/logo.png'

const Register = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const registrationType = searchParams.get('type') || 'signin'
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const loadingValue = useSelector(state => state.user.isLoading)
  const [errorType, setErrorType] = useState()

  const handleSignin = async (e) => {
    e.preventDefault()
    dispatch(loginStart())
    const form = new FormData(e.currentTarget)
    const username = form.get('username')
    const password = form.get('password')
    setTimeout(() => {
      const postData = async () => {
        try {
          const res = await axios.post('https://social-sphere-server.onrender.com/api/auth/signin', { username, password }, { withCredentials: true })
          dispatch(loginComplete(res.data))
          navigate('/')
        } catch (error) {
          dispatch(loginFail())
          setErrorType(error.response.data)
          console.error(error)
        }
      }
      postData()
    }, 3000)
  }
  
  const handleSignup = async (e) => {
    e.preventDefault()
    dispatch(loginStart())
    const form = new FormData(e.currentTarget)
    const username = form.get('username')
    const email = form.get('email')
    const password = form.get('password')
    setTimeout(() => {
      const postData = async () => {
        try {
          const res = await axios.post('https://social-sphere-server.onrender.com/api/auth/signup', { username, email, password }, { withCredentials: true })
          dispatch(loginComplete(res.data))
          navigate('/')
        } catch (error) {
          dispatch(loginFail())
          setErrorType(error.response.data)
          console.error(error)
        }
      }
      postData()
    }, 3000)
  }
  
  return (
        <section className="flex flex-col items-center justify-center w-screen h-screen max-h-screen gap-6 overflow-hidden bg-primaryBlack xl:flex-row _bg">
          
              <div className='hidden xl:block'>
                <img src={Logo} className='w-auto h-auto mx-auto -mt-20 '/>
                <p className='-mt-24 text-2xl text-center'>Welcome To SocialSphere.</p>
              </div>
            
              <div className="w-11/12 border-2 shadow-2xl rounded-2xl border-primaryBlue md:w-3/4 xl:w-5/12">
                  <div className='flex items-center justify-center w-full border-b-2 xl:hidden border-primaryBlue'>
                      <img src={Logo} className='h-14 w-14'/>
                      <span className='text-primaryBlue text-[0.7rem]'>by Jawad</span>
                  </div>
                  <div className='relative flex'>
                      <button onClick={() => setSearchParams({ type: 'signin' })} className='w-full py-3 text-center'>Sign In</button>
                      <button onClick={() => setSearchParams({ type: 'signup' })} className='w-full py-3 text-center'>Sign Up</button>
                      <div className={`absolute transition-all bottom-0 w-1/4 h-0.5 bg-primaryBlue -translate-x-1/2 ${registrationType.toLowerCase() === 'signin' ? 'left-1/4' : 'left-3/4'}`}></div>
                  </div>
                  <div className="p-6 space-y-4 md:space-y-6 sm:p-8 ">
                  {registrationType.toLowerCase()  === 'signin' && (
                      <form className="space-y-4 md:space-y-6" onSubmit={handleSignin}>
                              {errorType &&  (<p className='font-bold text-red-500'>{errorType}</p>)}
                              <div>
                                  <label htmlFor="username" className="block mb-2 text-sm">Username</label>
                                  <input type="text" name="username" id="username" className="border-2 border-transparent focus:border-primaryBlue outline-none  sm:text-sm rounded-lg  block w-full p-2.5 " placeholder="John_Doe" required/>
                              </div>
                              <div>
                                  <label htmlFor="password" className="block mb-2 text-sm">Password</label>
                                  <input type="password" name="password" id="password" placeholder="••••••••" className="border-2 border-transparent focus:border-primaryBlue outline-none sm:text-sm rounded-lg block w-full p-2.5 " required/>
                              </div>
                              <p className='text-[0.8rem]'>Dont have an account ? <button onClick={() => setSearchParams({ type: 'signup' })} className='text-primaryBlue'>Register here</button></p>
                              <button type="submit" className="w-full bg-secondaryBlue text-white focus:outline-none focus:border-primaryBlue rounded-lg text-sm px-5 py-2.5 text-center ">
                                {loadingValue ? 
                                <svg aria-hidden="true" className="mx-auto text-white w-7 h-7 animate-spin fill-primaryBlue" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                </svg>  : 'Login'}
                              </button>
                      </form>
                  )}
                  {registrationType.toLowerCase() === 'signup' && (
                      <form className="space-y-4 md:space-y-6" onSubmit={handleSignup}>
                              {errorType &&  (<p className='font-bold text-red-500'>{errorType}</p>)}
                              <div>
                                  <label htmlFor="username" className="block mb-2 text-sm">Username</label>
                                  <input type="text" name="username" id="username" maxLength='12' className="border-2 border-transparent focus:border-primaryBlue outline-none sm:text-sm rounded-lg block w-full p-2.5 " placeholder="John_Doe" required/>
                              </div>
                              <div>
                                  <label htmlFor="email" className="block mb-2 text-sm">Email</label>
                                  <input type="email" name="email" id="email" className="border-2 border-transparent focus:border-primaryBlue outline-none sm:text-sm rounded-lg  block w-full p-2.5 " placeholder="name@gmail.com" required/>
                              </div>
                              <div>
                                  <label htmlFor="password" className="block mb-2 text-sm">Password</label>
                                  <input type="password" name="password" id="password" minLength={6} placeholder="••••••••" className="border-2 border-transparent focus:border-primaryBlue outline-none  sm:text-sm rounded-lg  block w-full p-2.5 " required/>
                              </div>
                              <p className='text-[0.8rem]'>Already have an account ? <button onClick={() => setSearchParams({ type: 'signin' })} className='text-primaryBlue'>Sign in</button></p>
                              <button type="submit" className="w-full bg-secondaryBlue text-white focus:outline-none focus:border-primaryBlue rounded-lg text-sm px-5 py-2.5 text-center ">
                                {loadingValue ? 
                                <svg aria-hidden="true" className="mx-auto text-white w-7 h-7 animate-spin fill-primaryBlue" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                </svg>  : 'Create your account'}
                              </button>
                      </form>
                  )}

                  </div>
              </div>
            
        </section>
  )
}

export default Register