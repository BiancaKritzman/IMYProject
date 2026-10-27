import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignUpForm';

function SplashPage({ setCurrentUser }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <main className="mx-auto max-w-[450px] px-6 pt-12 text-center">
      <h1 className="[font-family:var(--font-heading)] mb-2 text-[2.8rem] leading-none text-[#2b2118]">Welcome to ENature</h1>
      <p className="mb-8 italic text-[#6e6052]">A place to share pictures capturing natural beauty</p>
      {isLogin ? <LoginForm onLoginSuccess={setCurrentUser} /> : <SignUpForm onLoginSuccess={setCurrentUser} />}
      <button
        type="button"
        onClick={() => setIsLogin(!isLogin)}
        className="mt-2 w-full rounded-md bg-[#4a382a] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#31241a]"
      >
        {isLogin ? 'Need an account? Sign up' : 'Already have an account? Log in'}
      </button>
    </main>
  );
}

export default SplashPage;