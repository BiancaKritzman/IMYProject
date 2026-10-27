import React, { useState } from 'react';

export default function EditProfile({ currentProfile, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    username: currentProfile.username || '',
    quote: currentProfile.quote || '',
    age: currentProfile.age || '',
    country: currentProfile.country || '',
    hobbies: currentProfile.hobbies || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-[#e6ded3] bg-[#fffdf9] p-8 text-left shadow-[0_4px_20px_rgba(43,33,24,0.05)]">
      <h3 className="[font-family:var(--font-heading)] mb-4 text-2xl text-[#2b2118]">Edit Profile Details</h3>

      <label className="mb-2 block text-sm font-medium text-[#2b2118]">Username</label>
      <input
        type="text"
        placeholder="Username"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        required
        className="mb-4 w-full rounded-md border border-[#e6ded3] bg-[#f4efe6] px-4 py-3 text-[0.95rem] text-[#2b2118] outline-none transition focus:border-[#4a382a]"
      />

      <label className="mb-2 block text-sm font-medium text-[#2b2118]">Quote</label>
      <input
        type="text"
        placeholder="Quote"
        value={formData.quote}
        onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
        className="mb-4 w-full rounded-md border border-[#e6ded3] bg-[#f4efe6] px-4 py-3 text-[0.95rem] text-[#2b2118] outline-none transition focus:border-[#4a382a]"
      />

      <label className="mb-2 block text-sm font-medium text-[#2b2118]">Age</label>
      <input
        type="number"
        placeholder="Age"
        value={formData.age}
        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
        className="mb-4 w-full rounded-md border border-[#e6ded3] bg-[#f4efe6] px-4 py-3 text-[0.95rem] text-[#2b2118] outline-none transition focus:border-[#4a382a]"
      />

      <label className="mb-2 block text-sm font-medium text-[#2b2118]">Country</label>
      <input
        type="text"
        placeholder="Country"
        value={formData.country}
        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
        className="mb-4 w-full rounded-md border border-[#e6ded3] bg-[#f4efe6] px-4 py-3 text-[0.95rem] text-[#2b2118] outline-none transition focus:border-[#4a382a]"
      />

      <label className="mb-2 block text-sm font-medium text-[#2b2118]">Hobbies</label>
      <input
        type="text"
        placeholder="Hobbies"
        value={formData.hobbies}
        onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
        className="mb-4 w-full rounded-md border border-[#e6ded3] bg-[#f4efe6] px-4 py-3 text-[0.95rem] text-[#2b2118] outline-none transition focus:border-[#4a382a]"
      />

      <div className="mt-4 flex gap-4">
        <button type="submit" className="rounded-md bg-[#4a382a] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#31241a]">
          Save Changes
        </button>
        <button type="button" onClick={onCancel} className="rounded-md bg-[#6e6052] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4f433b]">
          Cancel
        </button>
      </div>
    </form>
  );
}