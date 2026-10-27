import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginForm({ onLoginSuccess = () => {} }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please provide a valid email.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        const user = data.user || null;
        onLoginSuccess(user);
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
        navigate('/home');
      } else {
        setError(data.message || 'Failed to log in. Please check your credentials.');
      }
      alert(data.message);
    } catch (err) {
      console.error(err);
      setError('Something went wrong while logging in.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-[#e6ded3] bg-[#fffdf9] p-8 text-left shadow-[0_4px_20px_rgba(43,33,24,0.05)]">
      <h3 className="[font-family:var(--font-heading)] mb-4 text-2xl text-[#2b2118]">Login</h3>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="mb-4 w-full rounded-md border border-[#e6ded3] bg-[#f4efe6] px-4 py-3 text-[0.95rem] text-[#2b2118] outline-none transition focus:border-[#4a382a]"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="mb-4 w-full rounded-md border border-[#e6ded3] bg-[#f4efe6] px-4 py-3 text-[0.95rem] text-[#2b2118] outline-none transition focus:border-[#4a382a]"
      />
      <button type="submit" className="mt-2 w-full rounded-md bg-[#4a382a] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#31241a]">
        Sign In
      </button>
    </form>
  );
}

export default LoginForm;