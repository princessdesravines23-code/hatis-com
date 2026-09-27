import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import { supabase } from "../lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setSubmitting(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    navigate("/");
  }

  return (
    <>
      <Nav />
      <div className="max-w-[400px] mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <h1 className="text-[clamp(26px,4vw,32px)]">Log in to Hatis</h1>
          <p className="mt-2.5 text-[14.5px] text-ink-soft leading-relaxed">
            Welcome back — manage your page, tiers, and payouts.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email address"
            required
            className="w-full bg-canvas-2 border border-border rounded-[12px] px-4 py-3.5 text-[14px] outline-none focus:border-ink"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            required
            className="w-full bg-canvas-2 border border-border rounded-[12px] px-4 py-3.5 text-[14px] outline-none focus:border-ink"
          />

          <div className="flex justify-end -mt-1">
            <span className="text-[12.5px] text-ink-soft font-semibold cursor-pointer">
              Forgot password?
            </span>
          </div>

          {errorMsg && <p className="text-[13px] text-red">{errorMsg}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-[12px] bg-red text-white text-[14.5px] font-bold mt-1 disabled:opacity-40"
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[12.5px] text-ink-soft">or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-[12px] border border-border bg-canvas-2 text-[14px] font-semibold"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-[12px] border border-border bg-canvas-2 text-[14px] font-semibold"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
            Continue with Instagram
          </button>
        </form>

        <p className="text-center text-[13.5px] text-ink-soft mt-6">
          New to Hatis?{" "}
          <Link to="/become-creator" className="text-ink font-semibold underline">
            Create your page
          </Link>
        </p>
      </div>
    </>
  );
}
