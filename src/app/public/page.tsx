import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import Login from '@/components/Login';
import { redirect } from 'next/navigation';

export default async function Public() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/register');
  }
  
  return (
    <div className='flex flex-col space-y-3 justify-center items-center h-screen'>
      <div>You are accessing a public page</div>
      <div>
        <Login />
      </div>
    </div>
  )
}
