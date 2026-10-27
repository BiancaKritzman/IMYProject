import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function PostPreview({ id, profileId, postId, accountName, description }) {
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
        <p className="mb-5 text-[0.92rem] text-[#6e6052]">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => navigate(`/post/${resolvedPostId}`)}
        className="w-fit rounded-md bg-[#4a382a] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#31241a]"
      >
        View posts
      </button>
    </article>
  );
}

export default PostPreview;