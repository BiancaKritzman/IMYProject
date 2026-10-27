import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SignUpForm({ onLoginSuccess = () => {} }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (formData.name.trim() === '' || formData.password.trim() === '' || formData.confirmPassword.trim() === '' || formData.email.trim() === '') {
      setError('Please fill in all fields.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const user = data.user || { name: formData.name, email: formData.email };
        onLoginSuccess(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        navigate('/home');
      } else {
        setError(data.message || 'Failed to sign up. Please try again.');
      }
      alert(data.message);
    } catch (err) {
      console.error(err);
      setError('Something went wrong while signing up.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-[#e6ded3] bg-[#fffdf9] p-8 text-left shadow-[0_4px_20px_rgba(43,33,24,0.05)]">
      <h3 className="[font-family:var(--font-heading)] mb-4 text-2xl text-[#2b2118]">Sign Up</h3>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        className="mb-4 w-full rounded-md border border-[#e6ded3] bg-[#f4efe6] px-4 py-3 text-[0.95rem] text-[#2b2118] outline-none transition focus:border-[#4a382a]"
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
        className="mb-4 w-full rounded-md border border-[#e6ded3] bg-[#f4efe6] px-4 py-3 text-[0.95rem] text-[#2b2118] outline-none transition focus:border-[#4a382a]"
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
        className="mb-4 w-full rounded-md border border-[#e6ded3] bg-[#f4efe6] px-4 py-3 text-[0.95rem] text-[#2b2118] outline-none transition focus:border-[#4a382a]"
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        required
        className="mb-4 w-full rounded-md border border-[#e6ded3] bg-[#f4efe6] px-4 py-3 text-[0.95rem] text-[#2b2118] outline-none transition focus:border-[#4a382a]"
      />
      <button type="submit" className="mt-2 w-full rounded-md bg-[#4a382a] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#31241a]">
        Create Account
      </button>
    </form>
  );
}

export default SignUpForm;