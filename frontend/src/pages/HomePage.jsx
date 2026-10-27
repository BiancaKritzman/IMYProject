import React, { useState, useEffect } from 'react';
import SearchInput from '../components/SearchInput';
import PostPreview from '../components/PostPreview';
import ProfilePreview from '../components/ProfilePreview';

function HomePage() {
  const [search, setSearch] = useState('');
  const [localAccounts, setLocalAccounts] = useState([]);
  const [globalAccounts, setGlobalAccounts] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/social-data');
        const data = await res.json();

        setPosts(data.posts || []);
        setUsers(data.users || []);

        const postCards = posts.map(post => {
          const author = users.find(user => String(user._id) === String(post.userId));
          return {
            ...post,
            authorName: author?.name || 'Unknown user'
          };
        });

        if (!res.ok) throw new Error('Failed to load social data');

        const result = await res.json();
        setLocalAccounts(result.localAccounts || []);
        setGlobalAccounts(result.globalAccounts || []);
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