import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import { supabase } from "../lib/supabase";
import { slugify, pickGradient, initialsFrom } from "../lib/slugify";
import { categories } from "../data/creators";

export default function BecomeCreator() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", category: categories[0] });
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const update =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) return;
    setSubmitting(true);
    setErrorMsg(null);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      setErrorMsg(authError.message);
      setSubmitting(false);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setErrorMsg("Signed up, but check your email to confirm your account before continuing.");
      setSubmitting(false);
      return;
    }

    const [c1, c2] = pickGradient();

    const { error: profileError } = await supabase.from("creators").insert({
      user_id: userId,
      username: slugify(form.name),
      display_name: form.name,
      category: form.category,
      avatar_initials: initialsFrom(form.name),
      gradient_from: c1,
      gradient_to: c2,
      bio: "",
      supporters_count: 0,
    });

    setSubmitting(false);

    if (profileError) {
      setErrorMsg(`Account created, but your page couldn't be set up: ${profileError.message}`);
      return;
    }

    navigate(`/${slugify(form.name)}`);
  }

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

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <input
            value={form.name}
            onChange={update("name")}
            placeholder="Display name"
            required
            className="w-full bg-canvas-2 border border-border rounded-[12px] px-4 py-3.5 text-[14px] outline-none focus:border-ink"
          />

          <select
            value={form.category}
            onChange={update("category")}
            required
            className="w-full bg-canvas-2 border border-border rounded-[12px] px-4 py-3.5 text-[14px] outline-none focus:border-ink"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

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

          {errorMsg && <p className="text-[13px] text-red">{errorMsg}</p>}

          <button
            type="submit"
            disabled={!agreed || submitting}
            className="w-full py-3.5 rounded-[12px] bg-red text-white text-[14.5px] font-bold mt-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating…" : "Create my account"}
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
