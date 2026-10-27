import React, { useEffect, useState } from 'react';

const emptyForm = {
  title: '',
  imageUrl: '',
  caption: ''
};

function CreatePost({ userId, onCreate, initialValues = null, onCancel = null, submitLabel = 'Publish' }) {
  const [formData, setFormData] = useState(initialValues || emptyForm);

  useEffect(() => {
    setFormData(initialValues || emptyForm);
  }, [initialValues]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title?.trim() || !formData.imageUrl?.trim()) return;

    await onCreate({
      userId,
      title: formData.title.trim(),
      imageUrl: formData.imageUrl.trim(),
      caption: formData.caption?.trim() || ''
    });

    if (!initialValues) {
      setFormData(emptyForm);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-[#e6ded3] bg-[#fffdf9] p-8 text-left shadow-[0_4px_20px_rgba(43,33,24,0.05)]">
      <h3 className="[font-family:var(--font-heading)] mb-4 text-2xl text-[#2b2118]">
        {initialValues ? 'Edit Post' : 'Create New Post'}
      </h3>

      <input
        type="text"
        placeholder="Post Title"
        value={formData.title}
        onChange={(e) => setFormData((current) => ({ ...current, title: e.target.value }))}
        required
        className="mb-4 w-full rounded-md border border-[#e6ded3] bg-[#f4efe6] px-4 py-3 text-[0.95rem] text-[#2b2118] outline-none transition focus:border-[#4a382a]"
      />

      <input
        type="url"
        placeholder="Image URL"
        value={formData.imageUrl}
        onChange={(e) => setFormData((current) => ({ ...current, imageUrl: e.target.value }))}
        required
        className="mb-4 w-full rounded-md border border-[#e6ded3] bg-[#f4efe6] px-4 py-3 text-[0.95rem] text-[#2b2118] outline-none transition focus:border-[#4a382a]"
      />

      <textarea
        placeholder="Caption"
        value={formData.caption}
        onChange={(e) => setFormData((current) => ({ ...current, caption: e.target.value }))}
        rows="3"
        className="mb-4 w-full rounded-md border border-[#e6ded3] bg-[#f4efe6] px-4 py-3 text-[0.95rem] text-[#2b2118] outline-none transition focus:border-[#4a382a]"
      />

      <div className="flex gap-3">
        <button type="submit" className="flex-1 rounded-md bg-[#4a382a] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#31241a]">
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md bg-[#6e6052] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#4f433b]"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default CreatePost;