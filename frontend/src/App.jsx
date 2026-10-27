import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Nav from './components/Nav';
import SplashPage from './pages/SplashPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import PostPage from './pages/PostPage';
import NotFound from './components/NotFound';
import { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';

function Layout() {
  const location = useLocation();
  const isSplash = location.pathname === '/';
   const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  return (
    <>
      {!isSplash && <Nav />}
      <Routes>
        <Route
          path="/"
          element={<SplashPage currentUser={currentUser} setCurrentUser={setCurrentUser} />}
        />
        <Route
          path="/login"
          element={<LoginForm onLoginSuccess={setCurrentUser} />}
        />
        <Route
          path="/home"
          element={<HomePage currentUser={currentUser} />}
        />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/post/:id" element={<PostPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}