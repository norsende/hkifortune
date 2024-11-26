'use client';

import { signIn } from 'next-auth/react';

const LoginPage = () => {

    const onSignInButtonClicked = async () => {
        await signIn('google', { callbackUrl: '/' });
    }

    return (
        <div className="flex justify-center items-center h-screen">
            <button className="border-gray border-4 space-x-10 p-4 rounded-lg"
                onClick={onSignInButtonClicked}
            >
                Sign in with Google
            </button>
        </div>
    );
}

export default LoginPage;