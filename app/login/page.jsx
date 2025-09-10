"use client";
import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const cb = url.searchParams.get("callbackUrl");
    if (session && cb && !redirecting) {
      setRedirecting(true);
      window.location.href = cb;
    }
  }, [session, redirecting]);

  return (
    <main className="min-h-screen bg-[#F5F5F4] text-[#2F3E46]">
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold">{session ? "You’re signed in" : "Sign in"}</h1>
          <p className="mt-2 text-[#2F3E46]/80">Use your GitHub account to continue.</p>
        </header>
        <div className="rounded-2xl bg-white border border-[#E6E6E6] p-6 shadow-sm space-y-4">
          {status === "loading" ? (
            <div>Loading...</div>
          ) : session ? (
            <div className="space-y-3">
              <div className="text-sm text-[#2F3E46]/80">Signed in as {session.user?.email || session.user?.name}</div>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full rounded-xl border border-[#2F3E46] px-4 py-2 font-semibold hover:bg-[#EDEDED]">Sign out</button>
            </div>
          ) : (
            <button onClick={() => signIn("github", { callbackUrl: "/pricing" })} className="w-full rounded-xl bg-[#4ECDC4] px-4 py-2 font-semibold text-[#2F3E46] hover:opacity-90">Sign in with GitHub</button>
          )}
          <a href="/" className="block text-center text-sm underline">Back to home</a>
        </div>
      </div>
    </main>
  );
}
