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
    account_name: 'Bianca'
  };

  const [post, setPost] = useState(null);
  const [album, setAlbum] = useState(fallbackAlbum);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const normalizeComments = (commentList) => {
    if (!Array.isArray(commentList)) {
      return [];
    }

    return commentList
      .map((comment, index) => {
        const commentText = typeof comment === 'string' ? comment : comment?.text || comment?.comment || comment?.message || '';
        const author = typeof comment === 'string' ? 'Friend' : comment?.author || comment?.name || 'Friend';

        if (!commentText.trim()) {
          return null;
        }

        return {
          id: comment?._id || comment?.id || `${author}-${commentText}-${index}`,
          author,
          text: commentText
        };
      })
      .filter(Boolean);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/social-data');
        if (!res.ok) throw new Error('Failed to load post data');

        const result = await res.json();
        const posts = result.posts || [];
        const albums = result.albums || [];

        const foundPost = posts.find((item) => {
          const itemId = String(item._id || item.id || '');
          return itemId === String(id);
        });

        const foundAlbum = albums.find((item) => {
          const postIds = item.postIds || item.posts || [];
          return postIds.map(String).includes(String(id));
        }) || {
          name: 'General Gallery',
          description: 'A collection of shared moments.',
          userId: foundPost?.userId || '1',
          postIds: [id]
        };

        let activePost = null;
        if (foundPost) {
          activePost = {
            id: foundPost._id || foundPost.id || id,
            userId: foundPost.userId || foundPost.account_id || '1',
            title: foundPost.title || foundPost.name || foundPost.account_name || 'Untitled Post',
            caption: foundPost.caption || foundPost.description || '',
            description: foundPost.description || foundPost.caption || '',
            imageUrl: foundPost.imageUrl || foundPost.image || foundPost.photoUrl || '',
            account_name: foundPost.account_name || foundPost.name || 'User',
            comments: normalizeComments(foundPost.comments || foundPost.commentList || [])
          };
        } else {
          const localPosts = JSON.parse(localStorage.getItem('createdPosts') || '[]');
          const localPost = localPosts.find(p => String(p.id || p._id) === String(id));
          activePost = localPost || {
            id,
            title: 'Post Not Found',
            caption: 'This post could not be retrieved.',
            imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
            comments: []
          };
        }

        const savedCommentsMap = JSON.parse(localStorage.getItem('post_comments_map') || '{}');
        const persistedComments = savedCommentsMap[String(id)];
        const finalComments = persistedComments !== undefined ? persistedComments : activePost.comments;

        setPost(activePost);
        setAlbum(foundAlbum);
        setComments(finalComments);
      } catch (error) {
        console.error('Failed to load post data:', error);
      }
    };

    loadData();
  }, [id]);

 const handleAddComment = (event) => {
    event.preventDefault();
    const trimmedComment = newComment.trim();

    if (!trimmedComment) {
      return;
    }

    const storedUser = localStorage.getItem('currentUser');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    
    const authorName = currentUser?.name || currentUser?.email?.split('@')[0] || 'User';

    const newCommentObj = {
      id: Date.now(),
      author: authorName, 
      text: trimmedComment
    };

    setComments((previousComments) => {
      const updatedComments = [...previousComments, newCommentObj];

      const savedCommentsMap = JSON.parse(localStorage.getItem('post_comments_map') || '{}');
      savedCommentsMap[String(id)] = updatedComments;
      localStorage.setItem('post_comments_map', JSON.stringify(savedCommentsMap));

      return updatedComments;
    });

    setNewComment('');
  };

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

        {comments.length === 0 ? (
          <p className="mb-4 text-[#6e6052]">No comments yet. Be the first to share your thoughts.</p>
        ) : (
          <ul className="mb-5 list-disc space-y-2 pl-5 text-[#2b2118]">
            {comments.map((comment) => (
              <li key={comment.id}>
                <strong>{comment.author}:</strong> {comment.text}
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleAddComment} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            rows={3}
            placeholder="Write a comment..."
            className="w-full rounded-md border border-[#d9cab9] bg-white p-3 text-[#2b2118] outline-none transition focus:border-[#8a715a]"
          />
          <button
            type="submit"
            className="rounded-md bg-[#8a715a] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#755d49]"
          >
            Add comment
          </button>
        </form>
      </section>
    </main>
  );
}

export default PostPage;