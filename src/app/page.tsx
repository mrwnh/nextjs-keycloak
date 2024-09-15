import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'
import Login from '../components/Login'
import { redirect } from 'next/navigation'

export default async function Home({ searchParams }: { searchParams: { token?: string } }) {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/register')
  }
  
  return (
    <div className='flex justify-center items-center h-screen'>
      <Login invalidToken={searchParams.token ? true : false} />
    </div>
  )
}
