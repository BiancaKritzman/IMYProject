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
  onReport,
  onToggleHide,
  canAdmin = false
}) {
  const navigate = useNavigate();
  const resolvedProfileId = profileId || id;
  const resolvedPostId = postId || id;

  return (
    <article className="flex min-h-[220px] flex-col justify-between rounded-lg border border-[#e6ded3] bg-[#fffdf9] p-6 transition duration-200 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(43,33,24,0.05)]">
      <div>
        <h3 className="[font-family:var(--font-heading)] mb-2 text-xl text-[#2b2118]">
          <Link to={`/profile/${resolvedProfileId}`} className="text-[#2b2118] underline-offset-4 hover:underline">
            {accountName}
          </Link>
        </h3>

        {imageUrl && (
          <div className="mb-4 overflow-hidden rounded-md border border-[#e6ded3] bg-[#f4efe6]">
            <img 
              src={imageUrl} 
              alt={description || "Post image"} 
              className="h-48 w-full object-cover transition-transform duration-300 hover:scale-[1.02]" 
            />
          </div>
        )}

        <p className="mb-3 text-[0.92rem] text-[#6e6052]">{description}</p>
        
        {reportCount > 0 && (
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-[#8a715a]">
            Reports: {reportCount}
          </p>
        )}
        {isHidden && (
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-[#8a715a]">Hidden</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => navigate(`/post/${resolvedPostId}`)}
          className="w-fit rounded-md bg-[#4a382a] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#31241a]"
        >
          View posts
        </button>

        {onReport && (
          <button
            type="button"
            onClick={() => onReport(resolvedPostId)}
            className="w-fit rounded-md border border-[#d9a05b] bg-[#fff7ed] px-4 py-2.5 text-sm font-medium text-[#4a382a] transition-colors hover:bg-[#f2e5d4]"
          >
            Report post
          </button>
        )}

        {canAdmin && onToggleHide && (
          <button
            type="button"
            onClick={() => onToggleHide(resolvedPostId, isHidden)}
            className="w-fit rounded-md bg-[#6e6052] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4f433b]"
          >
            {isHidden ? 'Unhide' : 'Hide'}
          </button>
        )}
      </div>
    </article>
  );
}

export default PostPreview;