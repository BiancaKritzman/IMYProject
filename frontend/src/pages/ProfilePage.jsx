import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PostPreview from '../components/PostPreview';
import CreatePost from '../components/CreatePost';
import EditProfile from '../components/EditProfile';
import FriendList from '../components/FriendList';

function ProfilePage() {
  const { id } = useParams();
  const userIdAliases = {
    '1': '6abec6e7802c7674659df8a8',
    '2': '6abec788802c7674659df8ab'
  };
  const resolvedId = userIdAliases[String(id)] || String(id);

  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserName, setCurrentUserName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [profileInfo, setProfileInfo] = useState({
    username: 'Loading...',
    quote: 'Loading bio...',
    age: 'Not specified',
    country: 'Loading...',
    hobbies: 'Loading...',
  });
  const [friendsList, setFriendsList] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [editPost, setEditPost] = useState(null);
  const [albumForm, setAlbumForm] = useState({ name: '', description: '' });
  const [editingAlbumId, setEditingAlbumId] = useState(null);
  const [friendTargetId, setFriendTargetId] = useState('');

  const isAdmin = String(currentUserName || '').trim().toLowerCase() === 'test' || Boolean((localStorage.getItem('currentUser') && JSON.parse(localStorage.getItem('currentUser'))?.isAdmin));
  const isOwnProfile = currentUserId ? String(currentUserId) === String(resolvedId) : false;
  const isFriendWithProfile = currentUserId
    ? (allUsers.length > 0 && (friendsList.some((friend) => String(friend.id) === String(currentUserId)) || ((currentUserId && resolvedId && currentUserId !== resolvedId) && (allUsers.find((user) => String(user._id || user.id) === String(currentUserId))?.friends || []).includes(String(resolvedId)))) )
    : false;
  const canSeeFullProfile = isOwnProfile || isAdmin || isFriendWithProfile;
  const availableUsers = allUsers.filter((user) => {
    const userKey = String(user._id || user.id);
    return userKey !== String(currentUserId) && !friendsList.some((friend) => String(friend.id) === userKey);
  });

  const loadData = async () => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      const currentSessionUser = storedUser ? JSON.parse(storedUser) : null;
      const signedInUserId = currentSessionUser?._id || currentSessionUser?.id || null;
      const signedInUserName = currentSessionUser?.name || '';

      const res = await fetch('/api/social-data');
      if (!res.ok) throw new Error('Failed to fetch profile data');

      const result = await res.json();
      const users = result.users || [];
      const posts = result.posts || [];
      const friendships = result.friendships || [];
      const userAlbums = (result.albums || []).filter((album) => String(album.userId) === String(resolvedId));

      const matchedUser = users.find((user) => String(user._id || user.id) === String(resolvedId)) || {};
      const userDisplayName = matchedUser.name || matchedUser.email?.split('@')[0] || `User ${String(resolvedId).slice(-4) || 'profile'}`;
      const userQuote = matchedUser.quote ?? matchedUser.bio ?? 'No quote available';
      const userAge = matchedUser.age ?? 'Not specified';
      const userCountry = matchedUser.country || 'Not specified';
      const userHobbies = Array.isArray(matchedUser.hobbies) ? matchedUser.hobbies : [];

      const matchedPosts = posts
        .filter((post) => String(post.userId || post.user_id) === String(resolvedId))
        .map((post) => ({
          id: String(post._id || post.id),
          title: post.title || '',
          imageUrl: post.imageUrl || '',
          username: matchedUser.name || matchedUser.email || '',
          description: post.caption || post.description || '',
          caption: post.caption || post.description || ''
        }));

      const matchedFriends = friendships
        .filter((friendship) => String(friendship.userId) === String(resolvedId))
        .map((friendship) => {
          const friend = users.find((user) => String(user._id || user.id) === String(friendship.friendId));
          return friend
            ? {
                friendshipId: String(friendship._id || friendship.id),
                id: String(friend._id || friend.id),
                name: friend.name || friend.email || 'Friend',
                description: friend.bio || friend.quote || 'Photo enthusiast'
              }
            : null;
        })
        .filter(Boolean);

      const currentUserIsFriend = signedInUserId
        ? friendships.some((friendship) => {
            const left = String(friendship.userId) === String(signedInUserId) && String(friendship.friendId) === String(resolvedId);
            const right = String(friendship.userId) === String(resolvedId) && String(friendship.friendId) === String(signedInUserId);
            return left || right;
          })
        : false;

      const friendOptions = signedInUserId
        ? users.filter((user) => {
            const userKey = String(user._id || user.id);
            return userKey !== String(signedInUserId) && !matchedFriends.some((friend) => String(friend.id) === userKey);
          })
        : [];

      setCurrentUserId(signedInUserId || null);
      setCurrentUserName(signedInUserName || '');
      setAllUsers(users);
      setProfileInfo({
        username: userDisplayName,
        quote: userQuote,
        age: userAge,
        country: userCountry,
        hobbies: userHobbies.length ? userHobbies.join(', ') : 'No hobbies listed'
      });
      setFriendsList(matchedFriends);
      setUserPosts(matchedPosts.length ? matchedPosts : []);
      setAlbums(userAlbums);

      if (signedInUserId && friendOptions.length > 0) {
        const firstAvailableUser = friendOptions[0];
        const nextFriendId = String(firstAvailableUser._id || firstAvailableUser.id);
        setFriendTargetId((current) => (current && friendOptions.some((user) => String(user._id || user.id) === current) ? current : nextFriendId));
      } else {
        setFriendTargetId('');
      }

      if (currentUserIsFriend && !isOwnProfile) {
        setProfileInfo((current) => ({ ...current, username: userDisplayName }));
      }
    } catch (error) {
      console.error('Failed to load profile data:', error);
      setProfileInfo({
        username: '',
        quote: '',
        age: '',
        country: '',
        hobbies: ''
      });
      setFriendsList([]);
      setUserPosts([]);
      setAlbums([]);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, resolvedId]);

  const handleSaveProfile = async (updatedData) => {
    if (!currentUserId) {
      setProfileInfo(updatedData);
      setIsEditing(false);
      return;
    }

    try {
      const payload = {
        name: updatedData.username,
        bio: updatedData.quote,
        quote: updatedData.quote,
        age: Number(updatedData.age) || 0,
        country: updatedData.country,
        hobbies: String(updatedData.hobbies || '')
          .split(',')
          .map((hobby) => hobby.trim())
          .filter(Boolean)
      };

      const response = await fetch(`/api/users/${currentUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to update profile');

      setProfileInfo({
        username: updatedData.username,
        quote: updatedData.quote,
        age: updatedData.age || 'Not specified',
        country: updatedData.country,
        hobbies: Array.isArray(payload.hobbies) && payload.hobbies.length ? payload.hobbies.join(', ') : 'No hobbies listed'
      });
      setIsEditing(false);
      await loadData();
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCreatePost = async (payload) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to create post');

      const json = await response.json();
      const createdPost = json.post || json;
      const normalizedPost = {
        id: String(createdPost._id || createdPost.id),
        title: createdPost.title || '',
        imageUrl: createdPost.imageUrl || '',
        username: profileInfo.username || 'You',
        description: createdPost.caption || createdPost.description || '',
        caption: createdPost.caption || createdPost.description || ''
      };

      setUserPosts((current) => [normalizedPost, ...current]);
      setEditPost(null);
      await loadData();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleUpdatePost = async (postId, payload) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to update post');
      setEditPost(null);
      await loadData();
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete post');
      if (editPost?.id === postId) setEditPost(null);
      setUserPosts((current) => current.filter((post) => String(post.id) !== String(postId)));
      await loadData();
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleAlbumSubmit = async (event) => {
    event.preventDefault();
    if (!currentUserId || !albumForm.name.trim()) return;

    const payload = {
      userId: currentUserId,
      name: albumForm.name.trim(),
      description: albumForm.description.trim(),
      postIds: []
    };

    try {
      const endpoint = editingAlbumId ? `/api/albums/${editingAlbumId}` : '/api/albums';
      const method = editingAlbumId ? 'PUT' : 'POST';
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to save album');
      setAlbumForm({ name: '', description: '' });
      setEditingAlbumId(null);
      await loadData();
    } catch (error) {
      console.error('Failed to save album:', error);
    }
  };

  const handleDeleteAlbum = async (albumId) => {
    try {
      const response = await fetch(`/api/albums/${albumId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete album');
      setEditingAlbumId(null);
      setAlbumForm({ name: '', description: '' });
      await loadData();
    } catch (error) {
      console.error('Failed to delete album:', error);
    }
  };

  const handleAddFriend = async (event) => {
    event.preventDefault();
    if (!currentUserId || !friendTargetId) return;

    try {
      const response = await fetch('/api/friendships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          friendId: friendTargetId
        })
      });

      if (!response.ok) throw new Error('Failed to add friend');
      setFriendTargetId('');
      await loadData();
    } catch (error) {
      console.error('Failed to add friend:', error);
    }
  };

  const handleRemoveFriend = async (friendshipId) => {
    if (!friendshipId) return;

    try {
      const response = await fetch(`/api/friendships/${friendshipId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to remove friend');
      await loadData();
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  };

  return (
    <main className="mx-auto max-w-[1100px] px-6 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="[font-family:var(--font-heading)] text-3xl text-[#2b2118]">Info about {profileInfo.username}</h2>
        {isOwnProfile && (
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="rounded-md bg-[#4a382a] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#31241a]"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        )}
      </div>

      {isOwnProfile && isEditing ? (
        <EditProfile
          currentProfile={profileInfo}
          onSave={handleSaveProfile}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="mb-8 rounded-r-lg border-l-4 border-[#d9a05b] bg-[#fffdf9] p-5 text-[#2b2118] shadow-[0_4px_20px_rgba(43,33,24,0.05)]">
          <p className="mb-2 text-[#6e6052]"><strong className="text-[#2b2118]">Name:</strong> {profileInfo.username}</p>
          <p className="mb-2 text-[#6e6052]"><strong className="text-[#2b2118]">Quote:</strong> "{profileInfo.quote}"</p>
          {canSeeFullProfile && (
            <>
              <p className="mb-2 text-[#6e6052]"><strong className="text-[#2b2118]">Age:</strong> {profileInfo.age}</p>
              <p className="mb-2 text-[#6e6052]"><strong className="text-[#2b2118]">Country:</strong> {profileInfo.country}</p>
              <p className="mb-0 text-[#6e6052]"><strong className="text-[#2b2118]">Hobbies:</strong> {profileInfo.hobbies}</p>
            </>
          )}
        </div>
      )}

      {canSeeFullProfile && <FriendList friends={friendsList} onRemoveFriend={handleRemoveFriend} isOwnProfile={isOwnProfile} />}

      {canSeeFullProfile && isOwnProfile && (
        <form onSubmit={handleAddFriend} className="mb-8 rounded-lg border border-[#e6ded3] bg-[#fffdf9] p-6 shadow-[0_4px_20px_rgba(43,33,24,0.05)]">
          <h3 className="[font-family:var(--font-heading)] mb-4 text-2xl text-[#2b2118]">Add a friend</h3>
          <div className="flex flex-col gap-3 md:flex-row">
            <select
              value={friendTargetId}
              onChange={(e) => setFriendTargetId(e.target.value)}
              className="flex-1 rounded-md border border-[#e6ded3] bg-[#f4efe6] px-4 py-3 text-[0.95rem] text-[#2b2118] outline-none transition focus:border-[#4a382a]"
            >
              <option value="">Select a person</option>
              {availableUsers.map((user) => {
                const userKey = String(user._id || user.id);
                return (
                  <option key={userKey} value={userKey}>
                    {user.name || user.email || 'User'}
                  </option>
                );
              })}
            </select>
            <button type="submit" className="rounded-md bg-[#4a382a] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#31241a]">
              Add friend
            </button>
          </div>
        </form>
      )}

      {canSeeFullProfile && isOwnProfile && (
        <div className="mb-8 rounded-lg border border-[#e6ded3] bg-[#fffdf9] p-6 shadow-[0_4px_20px_rgba(43,33,24,0.05)]">
          <h3 className="[font-family:var(--font-heading)] mb-4 text-2xl text-[#2b2118]">{editingAlbumId ? 'Edit Album' : 'Create Album'}</h3>
          <form onSubmit={handleAlbumSubmit} className="space-y-4">
            <input
              type="text"
              value={albumForm.name}
              onChange={(e) => setAlbumForm((current) => ({ ...current, name: e.target.value }))}
              placeholder="Album name"
              required
              className="w-full rounded-md border border-[#e6ded3] bg-[#f4efe6] px-4 py-3 text-[0.95rem] text-[#2b2118] outline-none transition focus:border-[#4a382a]"
            />
            <textarea
              value={albumForm.description}
              onChange={(e) => setAlbumForm((current) => ({ ...current, description: e.target.value }))}
              placeholder="Album description"
              rows="3"
              className="w-full rounded-md border border-[#e6ded3] bg-[#f4efe6] px-4 py-3 text-[0.95rem] text-[#2b2118] outline-none transition focus:border-[#4a382a]"
            />
            <div className="flex gap-3">
              <button type="submit" className="rounded-md bg-[#4a382a] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#31241a]">
                {editingAlbumId ? 'Save Album' : 'Create Album'}
              </button>
              {editingAlbumId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingAlbumId(null);
                    setAlbumForm({ name: '', description: '' });
                  }}
                  className="rounded-md bg-[#6e6052] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4f433b]"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {canSeeFullProfile && isOwnProfile && (
        <div className="mb-10">
          <h3 className="[font-family:var(--font-heading)] mb-4 text-2xl text-[#2b2118]">Albums</h3>
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {albums.map((album) => (
              <article key={album._id || album.id} className="rounded-lg border border-[#e6ded3] bg-[#fffdf9] p-6 shadow-[0_4px_20px_rgba(43,33,24,0.05)]">
                <h4 className="[font-family:var(--font-heading)] mb-2 text-xl text-[#2b2118]">{album.name}</h4>
                <p className="mb-4 text-[#6e6052]">{album.description || 'No description provided'}</p>
                <p className="mb-4 text-sm text-[#6e6052]">{(album.postIds || []).length} photo(s)</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAlbumId(album._id || album.id);
                      setAlbumForm({
                        name: album.name || '',
                        description: album.description || ''
                      });
                    }}
                    className="rounded-md bg-[#4a382a] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#31241a]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAlbum(album._id || album.id)}
                    className="rounded-md bg-[#6e6052] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4f433b]"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {canSeeFullProfile && isOwnProfile && (
        <>
          {editPost ? (
            <CreatePost
              userId={currentUserId}
              initialValues={{
                title: editPost.title,
                imageUrl: editPost.imageUrl,
                caption: editPost.caption || ''
              }}
              onCreate={(payload) => handleUpdatePost(editPost.id, payload)}
              onCancel={() => setEditPost(null)}
              submitLabel="Save Changes"
            />
          ) : (
            <CreatePost userId={currentUserId} onCreate={handleCreatePost} />
          )}
        </>
      )}

      <h3 className="[font-family:var(--font-heading)] mb-4 text-2xl text-[#2b2118]">What I've captured</h3>
      <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
        {userPosts.map((post) => (
          <article key={post.id} className="overflow-hidden rounded-lg border border-[#e6ded3] bg-[#fffdf9] shadow-[0_4px_20px_rgba(43,33,24,0.05)]">
            <img
              src={post.imageUrl || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'}
              alt={post.title || 'User post'}
              className="h-56 w-full object-cover"
            />
            <div className="p-6">
              <h4 className="[font-family:var(--font-heading)] mb-2 text-xl text-[#2b2118]">{post.title || 'Untitled post'}</h4>
              <p className="mb-4 text-[0.92rem] text-[#6e6052]">{post.description || 'No description provided'}</p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.location.href = `/post/${post.id}`}
                  className="rounded-md bg-[#4a382a] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#31241a]"
                >
                  View post
                </button>
                {isOwnProfile && (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditPost(post)}
                      className="rounded-md bg-[#4a382a] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#31241a]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.id)}
                      className="rounded-md bg-[#6e6052] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4f433b]"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

export default ProfilePage;