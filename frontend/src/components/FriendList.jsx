import React from 'react';
import ProfilePreview from './ProfilePreview';

export default function FriendList({ friends, onRemoveFriend, isOwnProfile = false }) {
  return (
    <section className="mb-12">
      <h3 className="[font-family:var(--font-heading)] mb-4 text-2xl text-[#2b2118]">Friends</h3>
      {friends.length === 0 ? (
        <p className="rounded-lg border border-[#e6ded3] bg-[#fffdf9] p-4 text-[#6e6052] shadow-[0_4px_20px_rgba(43,33,24,0.05)]">
          No friends yet.
        </p>
      ) : (
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {friends.map((friend) => (
            <div key={friend.friendshipId || friend.id} className="flex flex-col justify-between gap-4 rounded-lg border border-[#e6ded3] bg-[#fffdf9] p-6 shadow-[0_4px_20px_rgba(43,33,24,0.05)]">
              <ProfilePreview
                id={friend.id}
                accountName={friend.name}
                description={friend.description}
              />
              {isOwnProfile && onRemoveFriend && (
                <button
                  type="button"
                  onClick={() => onRemoveFriend(friend.friendshipId || friend.id)}
                  className="rounded-md bg-[#6e6052] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4f433b]"
                >
                  Remove friend
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}