import React, { useState, useEffect } from 'react';
import SearchInput from '../components/SearchInput';
import PostPreview from '../components/PostPreview';
import AlbumPreview from '../components/AlbumPreview';

function HomePage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'local' | 'global'
  const [showHidden, setShowHidden] = useState(false);
  const [posts, setPosts] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  // Modal State for Reporting & Viewing Reasons
  const [reportingPostId, setReportingPostId] = useState(null);
  const [viewingReasonsPost, setViewingReasonsPost] = useState(null);
  const [selectedReason, setSelectedReason] = useState('Inappropriate');
  const [reportReasons, setReportReasons] = useState(['Inappropriate', 'Violent', 'AI', 'Other']);
  const [newReasonInput, setNewReasonInput] = useState('');
  const [isAddingReason, setIsAddingReason] = useState(false);

  // Strict check: Admin button is ONLY for user named "test"
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isAdmin = String(currentUser.name || '').trim().toLowerCase() === 'test';

  const handleDeletePost = (postId) => {
    setPosts((currentPosts) => {
      const updated = currentPosts.filter((p) => p.id !== postId);
      updateLocalStorageReports(updated);
      return updated;
    });
  };

  const handleDeleteAlbum = (albumId) => {
    setAlbums((currentAlbums) => currentAlbums.filter((a) => a.id !== albumId));
    if (selectedAlbum?.id === albumId) setSelectedAlbum(null);
  };

  const handleAddReportingReason = (e) => {
    e.preventDefault();
    const trimmed = newReasonInput.trim();
    if (trimmed && !reportReasons.includes(trimmed)) {
      setReportReasons((prev) => [...prev, trimmed]);
      setNewReasonInput('');
      setIsAddingReason(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/social-data');
        if (!res.ok) throw new Error('Failed to load social data');

        const result = await res.json();
        const users = result.users || [];
        const rawPosts = result.posts || [];
        const rawAlbums = result.albums || [];

        // Load saved report states from localStorage
        const savedReports = JSON.parse(localStorage.getItem('post_reports_tally') || '{}');

        const mappedPosts = rawPosts
          .map((post) => {
            const owner = users.find(
              (user) => String(user._id || user.id) === String(post.userId || post.user_id)
            );

            if (!owner) return null;

            let scope = post.scope || post.type;
            if (!scope) {
              const idStr = String(post._id || post.id || '');
              const charCodeSum = idStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
              scope = charCodeSum % 2 === 0 ? 'local' : 'global';
            }

            const postId = String(post._id || post.id);
            const persistedReport = savedReports[postId];
            const reportCount = persistedReport !== undefined 
              ? persistedReport.reportCount 
              : Number(post.reportCount || post.reports || 0);

            const isHidden = persistedReport !== undefined 
              ? persistedReport.isHidden 
              : Boolean(post.isHidden) || reportCount >= 2;

            return {
              id: postId,
              userId: String(owner._id || owner.id),
              name: owner.name || owner.email?.split('@')[0] || 'User',
              email: owner.email || '',
              desc: post.caption || post.description || post.title || 'No description',
              imageUrl: post.imageUrl || post.image || post.photoUrl || '',
              scope,
              reportCount,
              isHidden,
              reasons: persistedReport?.reasons || []
            };
          })
          .filter(Boolean);

        setPosts(mappedPosts);

        const mappedAlbums = rawAlbums
          .map((album) => {
            const owner = users.find(
              (user) => String(user._id || user.id) === String(album.userId)
            );

            if (!owner) return null;

            return {
              id: String(album._id || album.id),
              userId: String(owner._id || owner.id),
              name: album.name || 'Untitled Album',
              description: album.description || 'No description',
              ownerName: owner.name || owner.email?.split('@')[0] || 'User',
              email: owner.email || '',
              postIds: (album.postIds || []).map(String)
            };
          })
          .filter(Boolean);

        setAlbums(mappedAlbums);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  const updateLocalStorageReports = (updatedPosts) => {
    const reportsMap = {};
    updatedPosts.forEach((p) => {
      reportsMap[p.id] = {
        reportCount: p.reportCount,
        isHidden: p.isHidden,
        reasons: p.reasons || []
      };
    });
    localStorage.setItem('post_reports_tally', JSON.stringify(reportsMap));
  };

  const handleOpenReportModal = (postId) => {
    setReportingPostId(postId);
    setSelectedReason(reportReasons[0] || 'Inappropriate');
  };

  const handleConfirmReport = () => {
    if (!reportingPostId) return;

    setPosts((currentPosts) => {
      const updated = currentPosts.map((post) => {
        if (post.id === reportingPostId) {
          const newReportCount = post.reportCount + 1;
          const updatedReasons = [...(post.reasons || []), selectedReason];
          return {
            ...post,
            reportCount: newReportCount,
            reasons: updatedReasons,
            isHidden: post.isHidden || newReportCount >= 2
          };
        }
        return post;
      });
      updateLocalStorageReports(updated);
      return updated;
    });

    setReportingPostId(null);
  };

  const handleToggleHidePost = (postId) => {
    setPosts((currentPosts) => {
      const updated = currentPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            isHidden: !post.isHidden
          };
        }
        return post;
      });
      updateLocalStorageReports(updated);
      return updated;
    });
  };

  const matchesSearch = (item) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;

    const ownerName = String(item.name || item.ownerName || '').toLowerCase();
    const ownerEmail = String(item.email || item.ownerEmail || '').toLowerCase();
    const description = String(item.desc || item.description || '').toLowerCase();

    return (
      ownerName.includes(query) ||
      ownerEmail.includes(query) ||
      description.includes(query)
    );
  };

  const visiblePosts = posts.filter((post) => {
    if (!showHidden && post.isHidden) return false;
    return matchesSearch(post);
  });

  const filteredLocal = visiblePosts.filter((post) => post.scope === 'local');
  const filteredGlobal = visiblePosts.filter((post) => post.scope === 'global');
  const filteredAlbums = albums.filter(matchesSearch);

  const albumPosts = selectedAlbum
    ? visiblePosts.filter(
        (post) =>
          String(post.userId) === String(selectedAlbum.userId) ||
          selectedAlbum.postIds.includes(String(post.id))
      )
    : [];

  return (
    <main className="mx-auto max-w-[1100px] px-6 py-10">
      <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} />

      {/* Control Bar */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-[#4a382a] text-white'
                : 'border border-[#e6ded3] bg-[#fffdf9] text-[#2b2118] hover:bg-[#f4efe6]'
            }`}
          >
            All Posts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('local')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'local'
                ? 'bg-[#4a382a] text-white'
                : 'border border-[#e6ded3] bg-[#fffdf9] text-[#2b2118] hover:bg-[#f4efe6]'
            }`}
          >
            Local Posts ({filteredLocal.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('global')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'global'
                ? 'bg-[#4a382a] text-white'
                : 'border border-[#e6ded3] bg-[#fffdf9] text-[#2b2118] hover:bg-[#f4efe6]'
            }`}
          >
            Global Posts ({filteredGlobal.length})
          </button>
        </div>

        <div className="flex gap-2">
          {/* Admin ("test") Only Button */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsAddingReason(!isAddingReason)}
              className="rounded-md bg-[#4a382a] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#31241a]"
            >
              {isAddingReason ? 'Cancel Add Reason' : '+ Add Reporting Reason'}
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowHidden(!showHidden)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              showHidden
                ? 'bg-[#8a715a] text-white'
                : 'border border-[#e6ded3] bg-[#fffdf9] text-[#6e6052] hover:bg-[#f4efe6]'
            }`}
          >
            {showHidden ? 'Hide Hidden Posts' : 'Show Hidden Posts'}
          </button>
        </div>
      </div>

      {isAdmin && isAddingReason && (
        <form onSubmit={handleAddReportingReason} className="mb-6 flex gap-3 rounded-lg border border-[#e6ded3] bg-[#fffdf9] p-4 shadow-sm">
          <input
            type="text"
            value={newReasonInput}
            onChange={(e) => setNewReasonInput(e.target.value)}
            placeholder="Enter new report reason (e.g. Spam, Copyright)..."
            className="flex-1 rounded-md border border-[#e6ded3] bg-[#f4efe6] px-3 py-2 text-sm text-[#2b2118] outline-none"
            required
          />
          <button type="submit" className="rounded-md bg-[#4a382a] px-4 py-2 text-sm text-white">
            Add
          </button>
        </form>
      )}

      {/* Local Posts */}
      {(activeTab === 'all' || activeTab === 'local') && (
        <section className="mb-12">
          <h2 className="[font-family:var(--font-heading)] mb-4 text-3xl text-[#2b2118]">Local Posts</h2>
          {filteredLocal.length === 0 ? (
            <p className="text-sm italic text-[#6e6052]">No local posts to display.</p>
          ) : (
            <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {filteredLocal.map((post) => (
                <PostPreview
                  key={post.id}
                  id={post.id}
                  profileId={post.userId}
                  postId={post.id}
                  accountName={post.name}
                  imageUrl={post.imageUrl}
                  description={post.desc}
                  isHidden={post.isHidden}
                  reportCount={post.reportCount}
                  reasons={post.reasons}
                  onOpenReportModal={handleOpenReportModal}
                  onToggleHide={handleToggleHidePost}
                  isAdmin={isAdmin}
                  onDeletePost={handleDeletePost}
                  onViewReasons={() => setViewingReasonsPost(post)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Global Posts */}
      {(activeTab === 'all' || activeTab === 'global') && (
        <section className="mb-12">
          <h2 className="[font-family:var(--font-heading)] mb-4 text-3xl text-[#2b2118]">Global Posts</h2>
          {filteredGlobal.length === 0 ? (
            <p className="text-sm italic text-[#6e6052]">No global posts to display.</p>
          ) : (
            <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {filteredGlobal.map((post) => (
                <PostPreview
                  key={post.id}
                  id={post.id}
                  profileId={post.userId}
                  postId={post.id}
                  accountName={post.name}
                  imageUrl={post.imageUrl}
                  description={post.desc}
                  isHidden={post.isHidden}
                  reportCount={post.reportCount}
                  reasons={post.reasons}
                  onOpenReportModal={handleOpenReportModal}
                  onToggleHide={handleToggleHidePost}
                  isAdmin={isAdmin}
                  onDeletePost={handleDeletePost}
                  onViewReasons={() => setViewingReasonsPost(post)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Albums Section */}
      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="[font-family:var(--font-heading)] text-3xl text-[#2b2118]">Albums</h2>
          {selectedAlbum && (
            <button
              type="button"
              onClick={() => setSelectedAlbum(null)}
              className="text-sm font-medium text-[#d9a05b] underline"
            >
              Clear selected album
            </button>
          )}
        </div>

        <div className="mb-8 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {filteredAlbums.map((album) => (
            <AlbumPreview
              key={album.id}
              album={album}
              isSelected={selectedAlbum?.id === album.id}
              onSelect={setSelectedAlbum}
              isAdmin={isAdmin}
              onDeleteAlbum={handleDeleteAlbum}
            />
          ))}
        </div>

        {selectedAlbum && (
          <div>
            <h3 className="[font-family:var(--font-heading)] mb-4 text-2xl text-[#2b2118]">
              Posts in this Album
            </h3>
            {albumPosts.length === 0 ? (
              <p className="text-[#6e6052]">No visible posts found for this album.</p>
            ) : (
              <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                {albumPosts.map((post) => (
                  <PostPreview
                    key={`album-post-${post.id}`}
                    id={post.id}
                    profileId={post.userId}
                    postId={post.id}
                    accountName={post.name}
                    imageUrl={post.imageUrl}
                    description={post.desc}
                    isHidden={post.isHidden}
                    reportCount={post.reportCount}
                    reasons={post.reasons}
                    onOpenReportModal={handleOpenReportModal}
                    onToggleHide={handleToggleHidePost}
                    isAdmin={isAdmin}
                    onDeletePost={handleDeletePost}
                    onViewReasons={() => setViewingReasonsPost(post)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* REPORT REASONS MODAL */}
      {reportingPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-[#e6ded3] bg-[#fffdf9] p-6 shadow-xl">
            <h3 className="[font-family:var(--font-heading)] mb-2 text-2xl text-[#2b2118]">
              Report Post
            </h3>
            <p className="mb-4 text-sm text-[#6e6052]">
              Please select a reason for reporting this post:
            </p>

            <div className="mb-6 space-y-2">
              {reportReasons.map((reason) => (
                <label
                  key={reason}
                  className={`flex cursor-pointer items-center justify-between rounded-md border p-3 transition ${
                    selectedReason === reason
                      ? 'border-[#d9a05b] bg-[#fff7ed] font-medium text-[#2b2118]'
                      : 'border-[#e6ded3] bg-white text-[#6e6052] hover:bg-[#f4efe6]'
                  }`}
                >
                  <span>{reason}</span>
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-[#4a382a]"
                  />
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setReportingPostId(null)}
                className="rounded-md bg-[#6e6052] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4f433b]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReport}
                className="rounded-md bg-[#b91c1c] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#991b1b]"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW REPORT REASONS MODAL (Admin Only) */}
      {viewingReasonsPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-[#e6ded3] bg-[#fffdf9] p-6 shadow-xl">
            <h3 className="[font-family:var(--font-heading)] mb-2 text-2xl text-[#2b2118]">
              Report Reasons for Post
            </h3>
            <p className="mb-4 text-xs text-[#6e6052]">Post ID: {viewingReasonsPost.id}</p>

            {(!viewingReasonsPost.reasons || viewingReasonsPost.reasons.length === 0) ? (
              <p className="mb-6 text-sm italic text-[#6e6052]">No reasons logged for this post yet.</p>
            ) : (
              <ul className="mb-6 list-disc space-y-1 pl-5 text-sm text-[#2b2118]">
                {viewingReasonsPost.reasons.map((r, index) => (
                  <li key={`reason-${index}`}>{r}</li>
                ))}
              </ul>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setViewingReasonsPost(null)}
                className="rounded-md bg-[#4a382a] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#31241a]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default HomePage;