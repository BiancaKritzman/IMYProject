import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import SplashPage from './pages/SplashPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import PostPage from './pages/PostPage';

function Layout() {
  const location = useLocation();
  const hideHeader = location.pathname === '/';

  return (
    <>
      {!hideHeader && <Nav />}
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/post/:id" element={<PostPage />} />
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