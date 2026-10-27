import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePreview({ id, accountName, description }) {
  const navigate = useNavigate();

  return (
    <article className="profile-preview-card">
      <h3>{accountName}</h3>
      <p>{description}</p>
      <button onClick={() => navigate(`/profile/${id}`)}>
        View posts
      </button>
    </article>
  );
}