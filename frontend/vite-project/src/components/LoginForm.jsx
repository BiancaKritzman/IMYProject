import React, { useState } from 'react';

export default function LoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');

    // Fetch call to backend stubbed endpoint
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    console.log('Login Response:', data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="error-text">{error}</p>}
      <input 
        type="email" 
        placeholder="Email" 
        value={formData.email} 
        onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
        required 
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={formData.password} 
        onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
        required 
      />
      <button type="submit">Sign In</button>
    </form>
  );
}