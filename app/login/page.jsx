export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#F5F5F4] text-[#2F3E46]">
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold">Log in</h1>
          <p className="mt-2 text-[#2F3E46]/80">Placeholder form — wire up auth later.</p>
        </header>
        <form className="rounded-2xl bg-white border border-[#E6E6E6] p-6 shadow-sm space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input className="mt-2 w-full rounded-xl border border-[#CFCFCF] bg-white p-3 outline-none focus:ring-2 focus:ring-[#4ECDC4]" type="email" placeholder="you@example.com" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input className="mt-2 w-full rounded-xl border border-[#CFCFCF] bg-white p-3 outline-none focus:ring-2 focus:ring-[#4ECDC4]" type="password" placeholder="••••••••" />
          </label>
          <button type="button" className="w-full rounded-xl bg-[#4ECDC4] px-4 py-2 font-semibold text-[#2F3E46] hover:opacity-90">Log in</button>
          <p className="text-sm text-[#2F3E46]/80">No account? <a className="underline" href="/signup">Create one</a>.</p>
        </form>
        <div className="mt-6">
          <a href="/" className="rounded-xl border border-[#2F3E46] px-4 py-2 font-semibold hover:bg-[#EDEDED]">Back to home</a>
        </div>
      </div>
    </main>
  );
}

