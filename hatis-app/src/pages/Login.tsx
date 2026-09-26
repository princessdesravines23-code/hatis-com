import { useState } from "react";
import { Link } from "react-router-dom";
import Nav from "../components/Nav";

export default function BecomeCreator() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <>
      <Nav />
      <div className="max-w-[440px] mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <h1 className="text-[clamp(26px,4vw,32px)]">Create your Hatis page</h1>
          <p className="mt-2.5 text-[14.5px] text-ink-soft leading-relaxed">
            Set up your profile in a couple minutes — you can add payment methods and tiers
            once you're in.
          </p>
        </div>

        {submitted ? (
          <div className="bg-canvas-2 border border-border rounded-card p-6 text-center">
            <p className="text-[15px] font-semibold text-teal mb-1.5">Account created.</p>
            <p className="text-[13.5px] text-ink-soft">
              Welcome to Hatis, {form.name || "there"} — we'll follow up by email to help you
              pick your page name and finish setup.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (agreed) setSubmitted(true);
            }}
            className="flex flex-col gap-3.5"
          >
            <input
              value={form.name}
              onChange={update("name")}
              placeholder="Display name"
              required
              className="w-full bg-canvas-2 border border-border rounded-[12px] px-4 py-3.5 text-[14px] outline-none focus:border-ink"
            />

            <input
              value={form.email}
              onChange={update("email")}
              type="email"
              placeholder="Email address"
              required
              className="w-full bg-canvas-2 border border-border rounded-[12px] px-4 py-3.5 text-[14px] outline-none focus:border-ink"
            />

            <input
              value={form.password}
              onChange={update("password")}
              type="password"
              placeholder="Choose a password"
              required
              minLength={8}
              className="w-full bg-canvas-2 border border-border rounded-[12px] px-4 py-3.5 text-[14px] outline-none focus:border-ink"
            />

            <label className="flex items-start gap-2.5 mt-1 text-[13px] text-ink-soft leading-snug cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 accent-ink"
              />
              <span>
                I accept the{" "}
                <Link to="/terms" className="text-ink font-semibold underline">
                  terms
                </Link>{" "}
                and have read the{" "}
                <Link to="/privacy" className="text-ink font-semibold underline">
                  privacy policy
                </Link>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={!agreed}
              className="w-full py-3.5 rounded-[12px] bg-red text-white text-[14.5px] font-bold mt-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Create my account
            </button>

            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[12.5px] text-ink-soft">or sign up with</span>
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
        )}

        <p className="text-center text-[13.5px] text-ink-soft mt-6">
          Already have a page?{" "}
          <Link to="/login" className="text-ink font-semibold underline">
            Log in
          </Link>
        </p>
      </div>
    </>
  );
}