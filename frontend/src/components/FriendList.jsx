import React from 'react';

function FriendList({ friends = [], onRemoveFriend, isOwnProfile = false, isAdmin = false }) {
  if (friends.length === 0) {
    return <p className="mb-6 text-sm italic text-[#6e6052]">No friends added yet.</p>;
  }

  return (
    <div className="mb-8">
      <h3 className="[font-family:var(--font-heading)] mb-4 text-2xl text-[#2b2118]">Friends</h3>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {friends.map((friend) => (
          <div
            key={friend.friendshipId || friend.id}
            className="relative flex items-center justify-between rounded-lg border border-[#e6ded3] bg-[#fffdf9] p-4 shadow-sm"
          >
            <div>
              <p className="font-semibold text-[#2b2118]">{friend.name}</p>
              <p className="text-xs text-[#6e6052]">{friend.description || 'Friend'}</p>
            </div>

            {/* Show remove button if it's user's own profile OR if viewing as Admin */}
            {(isOwnProfile || isAdmin) && (
              <button
                type="button"
                aria-label="Remove friend"
                onClick={() => onRemoveFriend(friend.friendshipId || friend.id)}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700 transition hover:bg-red-200 hover:text-red-900"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FriendList;