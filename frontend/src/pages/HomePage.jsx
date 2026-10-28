import React, { useState, useEffect } from 'react';
import SearchInput from '../components/SearchInput';
import PostPreview from '../components/PostPreview';

function HomePage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'local' | 'global'
  const [showHidden, setShowHidden] = useState(false);
  const [posts, setPosts] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  // Modal State for Reporting
  const [reportingPostId, setReportingPostId] = useState(null);
  const [selectedReason, setSelectedReason] = useState('Inappropriate');

  const reportReasons = ['Inappropriate', 'Violent', 'AI', 'Other'];

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

  // Persist report data to localStorage
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

  // Open modal for specific post
  const handleOpenReportModal = (postId) => {
    setReportingPostId(postId);
    setSelectedReason('Inappropriate');
  };

  // Submit report reason
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
    const text = `${item.name || item.ownerName || ''} ${item.desc || item.description || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
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
                  onOpenReportModal={handleOpenReportModal}
                  onToggleHide={handleToggleHidePost}
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
                  onOpenReportModal={handleOpenReportModal}
                  onToggleHide={handleToggleHidePost}
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

        {selectedAlbum && (
          <div className="mb-6 rounded-lg border border-[#d9a05b] bg-[#fff7ed] p-4 text-[#2b2118]">
            <p className="font-semibold">Showing posts for album: "{selectedAlbum.name}"</p>
            <p className="text-xs text-[#6e6052]">By {selectedAlbum.ownerName}</p>
          </div>
        )}

        <div className="mb-8 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {filteredAlbums.map((album) => (
            <article
              key={album.id}
              onClick={() => setSelectedAlbum(album)}
              className={`cursor-pointer rounded-lg border p-6 transition duration-200 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(43,33,24,0.05)] ${
                selectedAlbum?.id === album.id
                  ? 'border-[#d9a05b] bg-[#fff7ed]'
                  : 'border-[#e6ded3] bg-[#fffdf9]'
              }`}
            >
              <p className="mb-1 text-xs uppercase tracking-widest text-[#8a715a]">
                By {album.ownerName}
              </p>
              <h3 className="[font-family:var(--font-heading)] mb-2 text-xl text-[#2b2118]">
                {album.name}
              </h3>
              <p className="text-[0.92rem] text-[#6e6052]">{album.description}</p>
            </article>
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
                    onOpenReportModal={handleOpenReportModal}
                    onToggleHide={handleToggleHidePost}
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
    </main>
  );
}

export default HomePage;