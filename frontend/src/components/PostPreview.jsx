import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function PostPreview({
  id,
  profileId,
  postId,
  accountName,
  imageUrl,
  description,
  isHidden = false,
  reportCount = 0,
  reasons = [],
  onOpenReportModal,
  onToggleHide,
  isAdmin = false,
  onDeletePost,
  onViewReasons,
  onEditPost
}) {
  const navigate = useNavigate();
  const resolvedProfileId = profileId || id;
  const resolvedPostId = postId || id;

  return (
    <article
      className={`relative flex min-h-[220px] flex-col justify-between rounded-lg border bg-[#fffdf9] p-6 transition duration-200 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(43,33,24,0.05)] ${
        isHidden ? 'border-red-300 opacity-60' : 'border-[#e6ded3]'
      }`}
    >
      {/* Admin Delete Button (X) in top right corner */}
      {isAdmin && onDeletePost && (
        <button
          type="button"
          aria-label="Delete post"
          onClick={(e) => {
            e.stopPropagation();
            onDeletePost(resolvedPostId);
          }}
          className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700 transition hover:bg-red-200 hover:text-red-900"
        >
          ✕
        </button>
      )}

      <div>
        <div className="flex items-center justify-between pr-8">
          <h3 className="[font-family:var(--font-heading)] mb-2 text-xl text-[#2b2118]">
            <Link to={`/profile/${resolvedProfileId}`} className="text-[#2b2118] underline-offset-4 hover:underline">
              {accountName}
            </Link>
          </h3>
          {isHidden && (
            <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold uppercase text-red-700">
              Hidden
            </span>
          )}
        </div>

        {imageUrl && (
          <div className="mb-4 overflow-hidden rounded-md border border-[#e6ded3] bg-[#f4efe6]">
            <img
              src={imageUrl}
              alt={description || 'Post preview'}
              className="h-48 w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
            />
          </div>
        )}

        <p className="mb-3 text-[0.92rem] text-[#6e6052]">{description}</p>

        {reportCount > 0 && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#b91c1c]">
            Reports: {reportCount}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="button"
          onClick={() => navigate(`/post/${resolvedPostId}`)}
          className="rounded-md bg-[#4a382a] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#31241a]"
        >
          View post
        </button>

        {onOpenReportModal && (
          <button
            type="button"
            onClick={() => onOpenReportModal(resolvedPostId)}
            className="rounded-md border border-[#d9a05b] bg-[#fff7ed] px-3.5 py-2 text-xs font-medium text-[#4a382a] transition-colors hover:bg-[#f2e5d4]"
          >
            Report post
          </button>
        )}

        {/* Admin button to view reasons for report */}
        {isAdmin && onViewReasons && (
          <button
            type="button"
            onClick={onViewReasons}
            className="rounded-md border border-red-300 bg-red-50 px-3.5 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            View reason for report
          </button>
        )}
        {/* Admin button to edit post */}
        {isAdmin && onEditPost && (
          <button
            type="button"
            onClick={() => onEditPost(resolvedPostId)}
            className="rounded-md border border-[#4a382a] bg-[#4a382a] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#31241a]"
          >
            Edit post
          </button>
        )}
      </div>
    </article>
  );
}

export default PostPreview;