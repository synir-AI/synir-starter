export default function LegalPage() {
  return (
    <main className="min-h-screen bg-[#F5F5F4] text-[#2F3E46]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <section>
          <h1 className="text-3xl font-semibold">Terms of Service</h1>
          <p className="mt-3 text-[#2F3E46]/80">
            This is a placeholder Terms of Service. Replace with your actual terms. By using this site, you agree to the
            acceptable use of the tools and to comply with applicable laws.
          </p>
          <ul className="mt-4 list-disc pl-6 text-[#2F3E46]/80">
            <li>Do not upload content you don’t have rights to process.</li>
            <li>No unlawful, harmful, or harassing content.</li>
            <li>Service provided as‑is without warranties.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-semibold">Privacy Policy</h2>
          <p className="mt-3 text-[#2F3E46]/80">
            This is a placeholder Privacy Policy. Replace with your actual policy. We process uploaded images to fulfill tool
            requests and do not sell your data.
          </p>
          <ul className="mt-4 list-disc pl-6 text-[#2F3E46]/80">
            <li>Uploaded files are sent to third‑party processors only for the selected task.</li>
            <li>API keys are stored server‑side via environment variables.</li>
            <li>You can request deletion of processed content at any time.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
