export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[#F5F5F4] text-[#2F3E46]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-semibold">Help Center</h1>
        <p className="mt-3 text-[#2F3E46]/80">Common questions and guides will appear here.</p>
        <ul className="mt-6 list-disc pl-6 text-[#2F3E46]/80">
          <li>How to remove or replace backgrounds</li>
          <li>How to upscale images</li>
          <li>How to extend (outpaint) images</li>
        </ul>
      </div>
    </main>
  );
}

