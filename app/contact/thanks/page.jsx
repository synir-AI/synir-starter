export default function ContactThanksPage() {
  return (
    <main className="min-h-screen bg-[#F5F5F4] text-[#2F3E46]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-3xl font-semibold">Thanks for reaching out!</h1>
        <p className="mt-3 text-[#2F3E46]/80">
          We received your message and will get back to you soon.
        </p>
        <div className="mt-8">
          <a href="/" className="rounded-xl border border-[#2F3E46] px-4 py-2 font-semibold hover:bg-[#EDEDED]">Back to home</a>
        </div>
      </div>
    </main>
  );
}

