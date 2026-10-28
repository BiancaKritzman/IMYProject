import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Nav() {
  const location = useLocation();
  const [profileTarget, setProfileTarget] = useState('/profile/1');

  useEffect(() => {
    const resolveProfileTarget = async () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        const currentUser = storedUser ? JSON.parse(storedUser) : null;
        const signedInUserId = currentUser?._id || currentUser?.id;

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
        console.error('Failed to resolve profile target:', error);
        setProfileTarget('/profile/1');
      }
    };

    resolveProfileTarget();
  }, [location.pathname]);

  return (
    <header className="flex items-center justify-between border-b border-[#e6ded3] bg-[#fffdf9] px-6 py-6 shadow-[0_4px_20px_rgba(43,33,24,0.05)] md:px-20">
      <div className="flex flex-col gap-1">
        <h2 className="[font-family:var(--font-heading)] text-3xl tracking-[-0.5px] text-[#2b2118]">ENature</h2>
        <p className="text-[0.85rem] italic text-[#6e6052]">A place to share pictures capturing natural beauty</p>
      </div>
      <nav className="flex items-center gap-2 text-sm font-medium text-[#2b2118] md:gap-3">
        <Link className="transition-colors hover:text-[#d9a05b]" to="/home">Home</Link>
        <span className="text-[#6e6052]">|</span>
        <Link className="transition-colors hover:text-[#d9a05b]" to={profileTarget}>Profile</Link>
        <span className="text-[#6e6052]">|</span>
        <Link className="transition-colors hover:text-[#d9a05b]" to="/">Logout</Link>
      </nav>
    </header>
  );
}

export default Nav;