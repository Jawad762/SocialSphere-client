import './App.css'
import Sidebar from './components/Sidebar'
import RightSidebar from './components/RightSidebar'
import {createBrowserRouter, RouterProvider, Outlet} from 'react-router-dom'
import ErrorPage from './components/ErrorPage';
import HomePage from './pages/HomePage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import EditProfilePage from './pages/EditProfilePage.jsx';
import TweetDetails from './components/TweetDetails.jsx';
import ViewUserFollows from './components/ViewUserFollows.jsx';
import Explore from './components/Explore.jsx';
import { QueryClient, QueryClientProvider } from 'react-query'
import { useEffect, useState } from 'react';

const queryClient = new QueryClient()

function App() {

  const [token, setToken] = useState(localStorage.getItem('access_token') || null)
  
  useEffect(() => {
    setToken(localStorage.getItem('access_token'))
  }, [localStorage.getItem('access_token')])

  const Layout = () => {
    return (
      <>
        <Sidebar/>
        <Outlet/>
        <RightSidebar/>
      </>
    )
  }

  const router = createBrowserRouter([
    {
      path: '/',
      element: token !== null ? <Layout/> : <RegisterPage/>,
      errorElement: <ErrorPage/>,
      children: [
        {
          path: '/',
          element: <HomePage/>
        },
        {
          path: '/explore',
          element: <Explore/>
        },
        {
          path: '/profile/:id',
          element: <ProfilePage/>
        },
        {
          path: '/profile/:id/edit',
          element: <EditProfilePage/>
        },
        {
          path: '/profile/:id/:info',
          element: <ViewUserFollows/>
        },
        {
          path: '/tweet/:id',
          element: <TweetDetails/>
        }
      ]
    },
    
    {
      path: '/register',
      element: <RegisterPage/>,
      errorElement: <ErrorPage/>
    }
  ])
  
  return (
    <QueryClientProvider client={queryClient}>
      <main className='flex w-full h-full'>
        <RouterProvider router={router}></RouterProvider>
      </main>
    </QueryClientProvider>
  )
}

export default App