import React from 'react';

function SearchInput({ value, onChange }) {
  return (
    <div className="mx-auto mb-10 max-w-[500px]">
      <input
        type="text"
        placeholder="Search accounts or posts..."
        value={value}
        onChange={onChange}
        className="w-full rounded-full border border-[#e6ded3] bg-[#f4efe6] px-5 py-3 text-center text-[0.95rem] text-[#2b2118] outline-none transition focus:border-[#4a382a] placeholder:text-[#6e6052]"
      />
    </div>
  );
}

export default SearchInput;