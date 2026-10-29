import React from 'react';

function AlbumPreview({
  album,
  isSelected,
  onSelect,
  isAdmin = false,
  onDeleteAlbum
}) {
  return (
    <article
      onClick={() => onSelect(album)}
      className={`relative cursor-pointer rounded-lg border p-6 transition duration-200 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(43,33,24,0.05)] ${
        isSelected ? 'border-[#d9a05b] bg-[#fff7ed]' : 'border-[#e6ded3] bg-[#fffdf9]'
      }`}
    >
      {/* Admin Delete Button (X) */}
      {isAdmin && onDeleteAlbum && (
        <button
          type="button"
          aria-label="Delete album"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteAlbum(album.id);
          }}
          className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700 transition hover:bg-red-200 hover:text-red-900"
        >
          ✕
        </button>
      )}

      <p className="mb-1 text-xs uppercase tracking-widest text-[#8a715a]">
        By {album.ownerName}
      </p>
      <h3 className="[font-family:var(--font-heading)] mb-2 text-xl text-[#2b2118]">
        {album.name}
      </h3>
      <p className="text-[0.92rem] text-[#6e6052]">{album.description}</p>
    </article>
  );
}

export default AlbumPreview;