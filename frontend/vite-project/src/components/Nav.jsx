import React from 'react';
import { Link } from 'react-router-dom';

export default function Nav() {
  return (
    <header className="main-header">
      <div className="brand">
        <h2>ENature</h2>
        <span>A place to share pictures capturing natural beauty</span>
      </div>
      <nav>
        <Link to="/home">Home</Link>
        <Link to="/profile/1">Profile</Link>
      </nav>
    </header>
  );
}