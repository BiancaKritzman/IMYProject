import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Nav({ currentUser }) {
  const location = useLocation();
  const [profileTarget, setProfileTarget] = useState('/profile/1');
  const [activeUser, setActiveUser] = useState(currentUser);
  
  const [avatarImage, setAvatarImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const resolveUserAndTarget = async () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        const resolvedUser = storedUser ? JSON.parse(storedUser) : currentUser;
        setActiveUser(resolvedUser);

        if (resolvedUser?._id || resolvedUser?.id) {
          const userId = resolvedUser._id || resolvedUser.id;
          const savedAvatar = localStorage.getItem(`avatar_${userId}`);
          if (savedAvatar) setAvatarImage(savedAvatar);
        }

        const signedInUserId = resolvedUser?._id || resolvedUser?.id;

        if (signedInUserId) {
          setProfileTarget(`/profile/${signedInUserId}`);
          return;
        }

        const response = await fetch('/api/social-data');
        if (!response.ok) throw new Error('Failed to load profile target');

        const result = await response.json();
        const users = result.users || [];
        const firstUserId = users[0]?._id || users[0]?.id;
        setProfileTarget(firstUserId ? `/profile/${firstUserId}` : '/profile/1');
      } catch (error) {
        console.error('Failed to resolve profile target/user:', error);
        setProfileTarget('/profile/1');
      }
    };

    resolveUserAndTarget();
  }, [location.pathname, currentUser]);

  const displayName = activeUser?.name || activeUser?.email?.split('@')[0] || 'Guest';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'G';

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatarImage(imageUrl);

      const userId = activeUser?._id || activeUser?.id;
      if (userId) {
        localStorage.setItem(`avatar_${userId}`, imageUrl);
      }
    }
  };

  return (
    <header className="flex items-center justify-between border-b border-[#e6ded3] bg-[#fffdf9] px-6 py-6 shadow-[0_4px_20px_rgba(43,33,24,0.05)] md:px-20">
      <div className="flex flex-col gap-1">
        <h2 className="[font-family:var(--font-heading)] text-3xl tracking-[-0.5px] text-[#2b2118]">ENature</h2>
        <p className="text-[0.85rem] italic text-[#6e6052]">A place to share pictures capturing natural beauty</p>
      </div>

      <nav className="flex items-center gap-3 text-sm font-medium text-[#2b2118] md:gap-4">
        <Link className="transition-colors hover:text-[#d9a05b]" to="/home">Home</Link>
        <span className="text-[#6e6052]">|</span>
        <Link className="transition-colors hover:text-[#d9a05b]" to={profileTarget}>Profile</Link>
        <span className="text-[#6e6052]">|</span>
        <Link className="transition-colors hover:text-[#d9a05b]" to="/">Logout</Link>

        <div className="flex items-center gap-2 rounded-full border border-[#e6ded3] bg-[#f9f3ec] px-3 py-1.5">
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={handleAvatarClick}
            title="Click to change profile picture"
            className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#d9a05b] text-xs font-semibold text-white transition-opacity hover:opacity-80"
          >
            {avatarImage ? (
              <img src={avatarImage} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>

          <span className="text-[#2b2118]">{displayName}</span>
        </div>
      </nav>
    </header>
  );
}

export default Nav;