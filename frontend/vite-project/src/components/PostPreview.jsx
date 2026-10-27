import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PostPreview({ id, title, imageUrl, username }) {
  const navigate = useNavigate();

  return (
    <article className="post-preview-card">
      <img src={imageUrl} alt={title} onClick={() => navigate(`/post/${id}`)} />
      <h4>{title}</h4>
      <p>Captured by: <strong>{username}</strong></p>
    </article>
  );
}