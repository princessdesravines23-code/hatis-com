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

      navigate("/dashboard");
  }

  async function handleOAuth(provider: "google" | "facebook") {
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/become-creator` },
    });
    if (error) setErrorMsg(error.message);
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
            onClick={() => handleOAuth("google")}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-[12px] border border-border bg-canvas-2 text-[14px] font-semibold"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0012 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09A6.6 6.6 0 015.5 12c0-.73.13-1.43.34-2.09V7.06H2.18A11 11 0 001 12c0 1.77.42 3.45 1.18 4.94l3.66-2.85z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85C6.71 7.31 9.14 5.38 12 5.38z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => handleOAuth("facebook")}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-[12px] border border-border bg-canvas-2 text-[14px] font-semibold"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.25h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" />
            </svg>
            Continue with Facebook
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