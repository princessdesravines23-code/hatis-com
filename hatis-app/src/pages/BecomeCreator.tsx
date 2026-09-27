import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import { supabase } from "../lib/supabase";
import { slugify, pickGradient, initialsFrom } from "../lib/slugify";
import { isUsernameTaken, categories } from "../data/creators";

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

function generateDefaultBio(name: string, category: string | null): string {
  const firstName = name.trim().split(" ")[0] || "there";
  const label = category && category !== "__other__" ? category.toLowerCase() : "creator";
  const templates = [
    `Hi, I'm ${firstName} — a ${label} sharing my work here on Hatis. If you enjoy what I make, your support helps me keep going.`,
    `Welcome to my page! I'm ${firstName}, working as a ${label}. Every bit of support means a lot.`,
    `${firstName} here. I make things as a ${label} and I'm building this page one step at a time — thanks for stopping by.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

export default function BecomeCreator() {
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(true);
  const [oauthUserId, setOauthUserId] = useState<string | null>(null);

  // Steps: 1 username, 2 category, 3 about you (name+bio), 4 photo, 5 login (email signups only)
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const oauthTotalSteps = 4;

  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");

  const [category, setCategory] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState("");

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If someone lands here already signed in (e.g. just came back from Google/Facebook),
  // check whether they already have a page. If yes, send them straight there.
  // Otherwise pre-fill their name from the provider, and skip the login step later.
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: existing } = await supabase
          .from("creators")
          .select("username")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (existing) {
          navigate(`/${existing.username}`);
          return;
        }

        setOauthUserId(session.user.id);
        const metaName =
          (session.user.user_metadata?.full_name as string) ||
          (session.user.user_metadata?.name as string) ||
          "";
        if (metaName) setName(metaName);
      }
      setCheckingSession(false);
    });
  }, [navigate]);

  useEffect(() => {
    if (!username) {
      setUsernameStatus("idle");
      return;
    }
    if (username.length < 3) {
      setUsernameStatus("invalid");
      return;
    }
    setUsernameStatus("checking");
    const timeout = setTimeout(async () => {
      try {
        const taken = await isUsernameTaken(username);
        setUsernameStatus(taken ? "taken" : "available");
      } catch {
        setUsernameStatus("idle");
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [username]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleOAuth(provider: "google" | "facebook") {
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/become-creator` },
    });
    if (error) setErrorMsg(error.message);
  }

  function canContinue() {
    if (step === 1) return usernameStatus === "available";
    if (step === 2)
      return category !== null && (category !== "__other__" || customCategory.trim().length > 0);
    if (step === 3) return name.trim().length > 0;
    if (step === 4) return true;
    return false;
  }

  async function createCreatorProfile(userId: string) {
    let avatarUrl: string | null = null;
    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });
      if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`);
      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
      avatarUrl = publicUrlData.publicUrl;
    }

    const [c1, c2] = pickGradient();
    const finalCategory = category === "__other__" ? customCategory.trim() : category;
    const finalBio = bio.trim() || generateDefaultBio(name, finalCategory);

    const { error: profileError } = await supabase.from("creators").insert({
      user_id: userId,
      username,
      display_name: name,
      category: finalCategory,
      avatar_initials: initialsFrom(name),
      avatar_url: avatarUrl,
      gradient_from: c1,
      gradient_to: c2,
      bio: finalBio,
      supporters_count: 0,
    });
    if (profileError) throw new Error(profileError.message);

    navigate(`/${username}`);
  }

  // Used at the end of step 4 for OAuth users, who skip step 5 entirely.
  async function handleFinishOAuthSignup() {
    if (!oauthUserId) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await createCreatorProfile(oauthUserId);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) return;
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) throw new Error(authError.message);

      const userId = authData.user?.id;
      if (!userId) {
        throw new Error(
          "Check your email to confirm your account, then log in to finish setting up your page."
        );
      }

      await createCreatorProfile(userId);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingSession) {
    return (
      <>
        <Nav />
        <div className="max-w-[460px] mx-auto px-6 py-16 text-center text-ink-soft">
          Loading...
        </div>
      </>
    );
  }

  return (
    <>
      <Nav />
      <div className="max-w-[460px] mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <h1 className="text-[clamp(26px,4vw,32px)]">Create your Hatis page</h1>
          <div className="mt-4 flex justify-center gap-1.5">
            {Array.from({ length: oauthUserId ? oauthTotalSteps : totalSteps }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-8 rounded-pill ${i < step ? "bg-red" : "bg-border"}`}
              />
            ))}
          </div>
        </div>

        {errorMsg && (
          <p className="text-[13px] text-red font-medium bg-red/10 border border-red/20 rounded-[10px] px-3.5 py-2.5 mb-4">
            {errorMsg}
          </p>
        )}

        {/* Step 1: username, plus OAuth options if not already signed in */}
        {step === 1 && (
          <div className="flex flex-col gap-3.5">
            <p className="text-[14.5px] text-ink-soft text-center mb-1">
              Pick your link — this is how people find you.
            </p>
            <div className="w-full bg-canvas-2 border border-border rounded-[12px] px-4 py-3.5 text-[14px] flex items-center focus-within:border-ink">
              <span className="text-ink-soft mr-1">hatis.app/</span>
              <input
                value={username}
                onChange={(e) => setUsername(slugify(e.target.value))}
                className="flex-1 bg-transparent outline-none"
                autoFocus
              />
            </div>
            <p className="text-[12.5px] -mt-2 px-1">
              {usernameStatus === "checking" && <span className="text-ink-soft">Checking…</span>}
              {usernameStatus === "available" && (
                <span className="text-teal font-semibold">hatis.app/{username} is available</span>
              )}
              {usernameStatus === "taken" && (
                <span className="text-red font-semibold">That username is taken</span>
              )}
              {usernameStatus === "invalid" && (
                <span className="text-ink-soft">At least 3 characters</span>
              )}
            </p>
            <button
              type="button"
              disabled={!canContinue()}
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-[12px] bg-ink text-canvas text-[14.5px] font-bold mt-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>

            {!oauthUserId && (
              <>
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
              </>
            )}
          </div>
        )}

        {/* Step 2: category */}
        {step === 2 && (
          <div className="flex flex-col gap-3.5">
            <p className="text-[14.5px] text-ink-soft text-center mb-1">
              What do you make? Pick the closest fit.
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    setCustomCategory("");
                  }}
                  className={`px-4 py-2 rounded-pill border text-sm font-semibold transition-colors ${
                    category === cat
                      ? "bg-ink text-canvas border-ink"
                      : "bg-canvas-2 text-ink-soft border-border hover:border-ink"
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCategory("__other__")}
                className={`px-4 py-2 rounded-pill border text-sm font-semibold transition-colors ${
                  category === "__other__"
                    ? "bg-ink text-canvas border-ink"
                    : "bg-canvas-2 text-ink-soft border-border hover:border-ink"
                }`}
              >
                Other
              </button>
            </div>
            {category === "__other__" && (
              <input
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="What do you make? (e.g. Dancer, Rapper, Photographer)"
                className="w-full bg-canvas-2 border border-border rounded-[12px] px-4 py-3.5 text-[14px] outline-none focus:border-ink mt-1"
                autoFocus
              />
            )}
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 rounded-[12px] border border-border text-[14.5px] font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!canContinue()}
                onClick={() => setStep(3)}
                className="flex-1 py-3.5 rounded-[12px] bg-ink text-canvas text-[14.5px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: about you — name + bio */}
        {step === 3 && (
          <div className="flex flex-col gap-3.5">
            <p className="text-[14.5px] text-ink-soft text-center mb-1">
              Tell people a bit about you.
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Display name"
              className="w-full bg-canvas-2 border border-border rounded-[12px] px-4 py-3.5 text-[14px] outline-none focus:border-ink"
              autoFocus
            />
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short bio — what you make, who it's for (optional)"
              rows={4}
              className="w-full bg-canvas-2 border border-border rounded-[12px] px-4 py-3.5 text-[14px] outline-none focus:border-ink resize-none"
            />
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-3.5 rounded-[12px] border border-border text-[14.5px] font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!canContinue()}
                onClick={() => setStep(4)}
                className="flex-1 py-3.5 rounded-[12px] bg-ink text-canvas text-[14.5px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 4: photo. OAuth users finish here; email signups go on to step 5. */}
        {step === 4 && (
          <div className="flex flex-col gap-3.5 items-center">
            <p className="text-[14.5px] text-ink-soft text-center mb-1">
              Add a photo — you can change this anytime.
            </p>
            <label className="cursor-pointer">
              <div
                className="w-[120px] h-[120px] rounded-full border-4 border-canvas shadow-lg flex items-center justify-center font-display font-bold text-3xl text-canvas overflow-hidden"
                style={{
                  background: avatarPreview
                    ? undefined
                    : `linear-gradient(135deg, #14213D, #2A9D8F)`,
                }}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  initialsFrom(name)
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
            <span className="text-[13px] font-semibold text-ink underline">
              {avatarPreview ? "Change photo" : "Choose image"}
            </span>
            <div className="flex gap-2.5 mt-4 w-full">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3.5 rounded-[12px] border border-border text-[14.5px] font-semibold"
              >
                Back
              </button>
              {oauthUserId ? (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleFinishOAuthSignup}
                  className="flex-1 py-3.5 rounded-[12px] bg-red text-white text-[14.5px] font-bold disabled:opacity-40"
                >
                  {submitting ? "Creating…" : avatarPreview ? "Create my page" : "Skip and finish"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="flex-1 py-3.5 rounded-[12px] bg-ink text-canvas text-[14.5px] font-bold"
                >
                  {avatarPreview ? "Continue" : "Skip for now"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 5: only for email/password signups */}
        {step === 5 && !oauthUserId && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <p className="text-[14.5px] text-ink-soft text-center mb-1">
              Last step — set up how you'll log in.
            </p>
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
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex-1 py-3.5 rounded-[12px] border border-border text-[14.5px] font-semibold"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!agreed || submitting}
                className="flex-1 py-3.5 rounded-[12px] bg-red text-white text-[14.5px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? "Creating…" : "Create my page"}
              </button>
            </div>
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