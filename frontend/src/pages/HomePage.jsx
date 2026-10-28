import React, { useState, useEffect } from 'react';
import SearchInput from '../components/SearchInput';
import PostPreview from '../components/PostPreview';

function HomePage() {
  const [search, setSearch] = useState('');
  const [localAccounts, setLocalAccounts] = useState([]);
  const [globalAccounts, setGlobalAccounts] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/social-data');
        if (!res.ok) throw new Error('Failed to load social data');

        const result = await res.json();
        const users = result.users || [];

        const mappedAccounts = (result.posts || []).map((post) => {
          const owner = users.find((user) => String(user._id || user.id) === String(post.userId || post.user_id));
          return {
            id: String(post._id || post.id),
            userId: String(post.userId || post.user_id || owner?._id || owner?.id || ''),
            name: owner?.name || owner?.email?.split('@')[0] || 'Unknown user',
            desc: post.caption || post.title || 'No description'
          };
        });

        const shuffledAccounts = [...mappedAccounts].sort(() => Math.random() - 0.5);
        const midpoint = Math.ceil(shuffledAccounts.length / 2);

        setLocalAccounts(shuffledAccounts.slice(0, midpoint));
        setGlobalAccounts(shuffledAccounts.slice(midpoint));
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  const matchesSearch = (account) => {
    const text = `${account.name || ''} ${account.desc || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  };

  const filteredLocal = localAccounts.filter(matchesSearch);
  const filteredGlobal = globalAccounts.filter(matchesSearch);

  return (
    <main className="mx-auto max-w-[1100px] px-6 py-10">
      <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} />

      <section className="mb-12">
        <h2 className="[font-family:var(--font-heading)] mb-4 text-3xl text-[#2b2118]">Local</h2>
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {filteredLocal.map((acc) => (
            <PostPreview
              key={acc.userId || acc.id}
              id={acc.id}
              profileId={acc.userId || acc.id}
              postId={acc.id}
              accountName={acc.name}
              description={acc.desc}
            />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="[font-family:var(--font-heading)] mb-4 text-3xl text-[#2b2118]">Global</h2>
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {filteredGlobal.map((acc) => (
            <PostPreview
              key={acc.userId || acc.id}
              id={acc.id}
              profileId={acc.userId || acc.id}
              postId={acc.id}
              accountName={acc.name}
              description={acc.desc}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default HomePage;