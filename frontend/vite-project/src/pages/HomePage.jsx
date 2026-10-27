import React, { useState } from 'react';
import ProfilePreview from '../components/ProfilePreview';
import PostPreview from '../components/PostPreview';
import SearchInput from '../components/SearchInput';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Dummy data matching the visual draft
  const localAccounts = [
    { id: '1', name: 'Account 1', desc: 'Local nature photographer' },
    { id: '2', name: 'Account 2', desc: 'Wildlife enthusiast' },
    { id: '3', name: 'Account 3', desc: 'Landscape lover' },
  ];

  const globalAccounts = [
    { id: '4', name: 'Global 1', desc: 'International traveler' },
    { id: '5', name: 'Global 2', desc: 'Ocean & marine explorer' },
    { id: '6', name: 'Global 3', desc: 'Forest photographer' },
  ];

  return (
    <main className="home-container">
      <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

      <section className="feed-section">
        <h2>Local</h2>
        <div className="grid">
          {localAccounts.map(acc => (
            <ProfilePreview key={acc.id} id={acc.id} accountName={acc.name} description={acc.desc} />
          ))}
        </div>
      </section>

      <section className="feed-section">
        <h2>Global</h2>
        <div className="grid">
          {globalAccounts.map(acc => (
            <ProfilePreview key={acc.id} id={acc.id} accountName={acc.name} description={acc.desc} />
          ))}
        </div>
      </section>
    </main>
  );
}