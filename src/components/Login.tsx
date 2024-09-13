"use client"
import { signIn } from "next-auth/react";

interface LoginProps {
  invalidToken?: boolean;
}

export default function Login({ invalidToken = false }: LoginProps) {
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      {invalidToken && (
        <p className="text-red-500 mb-4">Invalid token. Please log in again.</p>
      )}
      <button
        onClick={() => signIn("keycloak")}
        className="bg-sky-500 hover:bg-sky-700 px-5 py-2 text-sm leading-5 rounded-full font-semibold text-white">
        Sign In to your EoR account to register
      </button>
    </div>
  )
}
