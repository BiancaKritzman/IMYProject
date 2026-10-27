import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function PostPage() {
  const { id } = useParams();
  const fallbackAlbum = {
    userId: '1',
    name: 'Travel Highlights',
    description: 'My best landscape shots',
    postIds: ['6abeafc6802c7674659df8a3']
  };
  const fallbackPost = {
    id,
    userId: '1',
    title: 'Sunrise Over Valley',
    caption: 'Captured during a quiet morning hike.',
    description: 'Love it here!',
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    account_name: 'jane_doe'
  };

  const [post, setPost] = useState(null);
  const [album, setAlbum] = useState(fallbackAlbum);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/social-data');
        if (!res.ok) throw new Error('Failed to load post data');

        const result = await res.json();
        const foundPost = (result.posts || []).find((item) => String(item._id || item.id) === String(id));
        const foundAlbum = (result.albums || []).find((item) => (item.postIds || []).includes(String(id))) || fallbackAlbum;

        const normalizedPost = foundPost
          ? {
              ...foundPost,
              id: foundPost._id || foundPost.id || id,
              userId: foundPost.userId || foundPost.account_id || '1',
              title: foundPost.title || foundPost.name || foundPost.account_name || fallbackPost.title,
              caption: foundPost.caption || foundPost.description || fallbackPost.caption,
              description: foundPost.description || foundPost.caption || fallbackPost.description,
              imageUrl: foundPost.imageUrl || foundPost.image || fallbackPost.imageUrl,
              account_name: foundPost.account_name || foundPost.name || fallbackPost.account_name
            }
          : fallbackPost;

        setPost(normalizedPost);
        setAlbum(foundAlbum);
      } catch (error) {
        console.error('Failed to load post data:', error);
        setPost(fallbackPost);
      }
    };

    loadData();
  }, [id]);

  if (!post) {
    return <main className="mx-auto max-w-[1100px] px-6 py-10">Loading post...</main>;
  }

  return (
    <main className="mx-auto max-w-[1100px] px-6 py-10">
      <div className="mb-6">
        <p className="mb-2 text-sm uppercase tracking-[0.2em] text-[#8a715a]">Album</p>
        <h2 className="[font-family:var(--font-heading)] mb-2 text-3xl text-[#2b2118]">{album.name}</h2>
        <p className="text-[#6e6052]">{album.description}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1.3fr_0.7fr]">
        <div>
          <img
            src={post.imageUrl || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'}
            alt={post.title || 'Post image'}
            className="h-[440px] w-full rounded-lg object-cover shadow-[0_4px_20px_rgba(43,33,24,0.05)]"
          />
        </div>

        <aside className="rounded-lg border border-[#e6ded3] bg-[#fffdf9] p-6 shadow-[0_4px_20px_rgba(43,33,24,0.05)]">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-[#8a715a]">Post</p>
          <h3 className="[font-family:var(--font-heading)] mb-3 text-2xl text-[#2b2118]">{post.title || 'Journey Through the Valley'}</h3>
          <p className="mb-3 text-[#6e6052]">{post.caption || post.description || 'Love it here!'}</p>
          <p className="mb-1 text-[#2b2118]">
            <strong>Owner userId:</strong> {album.userId}
          </p>
          <p className="mb-1 text-[#2b2118]">
            <strong>Post ID:</strong> {post.id || id}
          </p>
          <p className="text-[#2b2118]">
            <strong>Album post IDs:</strong> {album.postIds?.join(', ') || 'No post IDs available'}
          </p>
        </aside>
      </div>

      <section className="mt-8 rounded-lg border border-[#e6ded3] bg-[#fffdf9] p-6 shadow-[0_4px_20px_rgba(43,33,24,0.05)]">
        <h3 className="[font-family:var(--font-heading)] mb-3 text-2xl text-[#2b2118]">Comments</h3>
        <ul className="list-disc space-y-2 pl-5 text-[#2b2118]">
          <li><strong>Friend 1:</strong> Stunning shot!</li>
          <li><strong>Friend 2:</strong> Where was this taken?</li>
          <li><strong>jane_doe:</strong> Love it here!</li>
        </ul>
      </section>
    </main>
  );
}

export default PostPage;