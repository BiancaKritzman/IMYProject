function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <div className="max-w-xl text-center">
        <h1 className="[font-family:var(--font-heading)] mb-3 text-5xl text-[#2b2118]">404</h1>
        <p className="text-lg text-[#6e6052]">The page you requested does not exist.</p>
      </div>
    </main>
  );
}

export default NotFound;