import { SigninForm } from '@/components/signin-form'
import React from 'react'

const SignIn = () => {
  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/auth-bg.jpg")' }}
    >
      <div className="w-full max-w-sm md:max-w-4xl">
        <SigninForm />
      </div>
    </div>
  )
}

export default SignIn