import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import { supabase } from "../lib/supabase";
import { slugify, pickGradient, initialsFrom } from "../lib/slugify";
import { isUsernameTaken, categories } from "../data/creators";

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";
type AccountType = "creator" | "supporter";

const earningGoalOptions = [
  "Receive tips",
  "Build monthly membership income",
  "Sell products (physical or digital)",
  "Offer commissions or services",
];

function generateDefaultBio(name: string, category: string | null): string {
  const firstName = name.trim().split(" ")[0] || "there";
  const label = category ? category.toLowerCase() : "creator";
  const templates = [
    `Hi, I'm ${firstName} — a ${label} sharing my work here on Hatis. If you enjoy what I make, your support helps me keep going.`,
    `Welcome to my page! I'm ${firstName}, working as a ${label}. Every bit of support means a lot.`,
    `${firstName} here. I make things as a ${label} and I'm building this page one step at a time — thanks for stopping by.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

// Ordered step keys. accountType controls which optional steps are included.
function getStepOrder(accountType: AccountType | null): string[] {
  const order: string[] = ["accountType"];
  if (accountType === "creator") order.push("earningGoals");
  order.push("username", "avatar");
  if (accountType === "creator") order.push("interests");
  order.push("about");
  return order;
}

export default function BecomeCreator() {
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [signedUp, setSignedUp] = useState(false);

  const [stepKey, setStepKey] = useState("accountType");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [earningGoals, setEarningGoals] = useState<string[]>(["Receive tips"]);

  const [username, setUsername] = useState("");
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [interests, setInterests] = useState<string[]>([]);
  const [bio, setBio] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

        setUserId(session.user.id);
        setSignedUp(true);
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
    if (!usernameEdited) setUsername(slugify(name));
  }, [name, usernameEdited]);

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

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) return;
    setSubmitting(true);
    setErrorMsg(null);

    const { data, error } = await supabase.auth.signUp({ email, password });
    setSubmitting(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }
    if (!data.user || !data.session) {
      setErrorMsg(
        "Check your email to confirm your account, then log in to finish setting up your page."
      );
      return;
    }

    setUserId(data.user.id);
    setSignedUp(true);
  }

  function toggleEarningGoal(goal: string) {
    setEarningGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  }

  function toggleInterest(cat: string) {
    setInterests((prev) => (prev.includes(cat) ? prev.filter((i) => i !== cat) : [...prev, cat]));
  }

  const order = getStepOrder(accountType);
  const stepIndex = order.indexOf(stepKey);

  function goNext() {
    if (stepIndex < order.length - 1) {
      setStepKey(order[stepIndex + 1]);
    } else {
      handleFinish();
    }
  }

  function goBack() {
    if (stepIndex > 0) setStepKey(order[stepIndex - 1]);
  }

  function canContinue(): boolean {
    if (stepKey === "accountType") return accountType !== null;
    if (stepKey === "earningGoals") return earningGoals.length > 0;
    if (stepKey === "username") return usernameStatus === "available";
    if (stepKey === "avatar") return true;
    if (stepKey === "interests") return interests.length >= 3;
    if (stepKey === "about") return name.trim().length > 0;
    return false;
  }

  async function handleFinish() {
    if (!userId) return;
    setSubmitting(true);
    setErrorMsg(null);

    try {
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
      const primaryCategory = interests[0] ?? null;
      const finalBio = bio.trim() || generateDefaultBio(name, primaryCategory);

      const { error: profileError } = await supabase.from("creators").insert({
        user_id: userId,
        username,
        display_name: name,
        category: primaryCategory,
        avatar_initials: initialsFrom(name),
        avatar_url: avatarUrl,
        gradient_from: c1,
        gradient_to: c2,
        bio: finalBio,
        supporters_count: 0,
        account_type: accountType,
        earning_goals: accountType === "creator" ? earningGoals : null,
        interests: accountType === "creator" ? interests : null,
      });
      if (profileError) throw new Error(profileError.message);

      navigate(`/${username}`);
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
          <h1 className="text-[clamp(26px,4vw,32px)]">
            {!signedUp ? "Sign up — it's free!" : "Create your Hatis page"}
          </h1>
          {signedUp && (
            <div className="mt-4 flex justify-center gap-1.5">
              {order.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-8 rounded-pill ${
                    i <= stepIndex ? "bg-red" : "bg-border"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {errorMsg && (
          <p className="text-[13px] text-red font-medium bg-red/10 border border-red/20 rounded-[10px] px-3.5 py-2.5 mb-4">
            {errorMsg}
          </p>
        )}

        {/* Sign up: name + email + password, or OAuth */}
        {!signedUp && (
          <form onSubmit={handleSignUp} className="flex flex-col gap-3.5">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Display name"
              required
              className="w-full bg-canvas-2 border border-border rounded-[12px] px-4 py-3.5 text-[14px] outline-none focus:border-ink"
            />
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
        )}

        {/* Account type */}
        {signedUp && stepKey === "accountType" && (
          <div className="flex flex-col gap-3">
            <p className="text-[14.5px] text-ink-soft text-center mb-1">I'm a...</p>
            <button
              type="button"
              onClick={() => setAccountType("creator")}
              className={`text-left p-4 rounded-card border transition-colors ${
                accountType === "creator"
                  ? "border-ink bg-canvas-2"
                  : "border-border bg-canvas hover:border-ink"
              }`}
            >
              <div className="font-bold text-[15px]">Creator</div>
              <div className="text-[13px] text-ink-soft">I'm looking to make money from my passion</div>
            </button>
            <button
              type="button"
              onClick={() => setAccountType("supporter")}
              className={`text-left p-4 rounded-card border transition-colors ${
                accountType === "supporter"
                  ? "border-ink bg-canvas-2"
                  : "border-border bg-canvas hover:border-ink"
              }`}
            >
              <div className="font-bold text-[15px]">Supporter</div>
              <div className="text-[13px] text-ink-soft">I'm here to help creators do what they love</div>
            </button>
            <button
              type="button"
              disabled={!canContinue()}
              onClick={goNext}
              className="w-full py-3.5 rounded-[12px] bg-ink text-canvas text-[14.5px] font-bold mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {/* Earning goals (creators only) */}
        {signedUp && stepKey === "earningGoals" && (
          <div className="flex flex-col gap-3">
            <p className="text-[14.5px] text-ink-soft text-center mb-1">
              How are you planning to earn?
            </p>
            {earningGoalOptions.map((goal) => (
              <label
                key={goal}
                className="flex items-center gap-3 p-4 rounded-card border border-border bg-canvas-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={earningGoals.includes(goal)}
                  onChange={() => toggleEarningGoal(goal)}
                  className="accent-ink"
                />
                <span className="text-[14px] font-semibold">{goal}</span>
              </label>
            ))}
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={goBack}
                className="flex-1 py-3.5 rounded-[12px] border border-border text-[14.5px] font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!canContinue()}
                onClick={goNext}
                className="flex-1 py-3.5 rounded-[12px] bg-ink text-canvas text-[14.5px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Username */}
        {signedUp && stepKey === "username" && (
          <div className="flex flex-col gap-3.5">
            <p className="text-[14.5px] text-ink-soft text-center mb-1">
              Pick your link — this is how people find you.
            </p>
            <div className="w-full bg-canvas-2 border border-border rounded-[12px] px-4 py-3.5 text-[14px] flex items-center focus-within:border-ink">
              <span className="text-ink-soft mr-1">hatis.app/</span>
              <input
                value={username}
                onChange={(e) => {
                  setUsernameEdited(true);
                  setUsername(slugify(e.target.value));
                }}
                className="flex-1 bg-transparent outline-none"
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
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={goBack}
                className="flex-1 py-3.5 rounded-[12px] border border-border text-[14.5px] font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!canContinue()}
                onClick={goNext}
                className="flex-1 py-3.5 rounded-[12px] bg-ink text-canvas text-[14.5px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Avatar */}
        {signedUp && stepKey === "avatar" && (
          <div className="flex flex-col gap-3.5 items-center">
            <p className="text-[14.5px] text-ink-soft text-center mb-1">
              Choose your profile picture.
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
                onClick={goBack}
                className="flex-1 py-3.5 rounded-[12px] border border-border text-[14.5px] font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={goNext}
                className="flex-1 py-3.5 rounded-[12px] bg-ink text-canvas text-[14.5px] font-bold"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Interests (creators only, minimum 3) */}
        {signedUp && stepKey === "interests" && (
          <div className="flex flex-col gap-3.5">
            <p className="text-[14.5px] text-ink-soft text-center mb-1">
              Choose your interests — pick at least 3.
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleInterest(cat)}
                  className={`px-4 py-2 rounded-pill border text-sm font-semibold transition-colors ${
                    interests.includes(cat)
                      ? "bg-ink text-canvas border-ink"
                      : "bg-canvas-2 text-ink-soft border-border hover:border-ink"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <p className="text-[12.5px] text-ink-soft">
              {interests.length} of at least 3 selected
            </p>
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={goBack}
                className="flex-1 py-3.5 rounded-[12px] border border-border text-[14.5px] font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!canContinue()}
                onClick={goNext}
                className="flex-1 py-3.5 rounded-[12px] bg-ink text-canvas text-[14.5px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* About you: display name + bio, then finish */}
        {signedUp && stepKey === "about" && (
          <div className="flex flex-col gap-3.5">
            <p className="text-[14.5px] text-ink-soft text-center mb-1">About you</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Display name"
              className="w-full bg-canvas-2 border border-border rounded-[12px] px-4 py-3.5 text-[14px] outline-none focus:border-ink"
            />
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Introduce yourself so others can get to know you... (optional)"
              rows={5}
              className="w-full bg-canvas-2 border border-border rounded-[12px] px-4 py-3.5 text-[14px] outline-none focus:border-ink resize-none"
            />
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={goBack}
                className="flex-1 py-3.5 rounded-[12px] border border-border text-[14.5px] font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!canContinue() || submitting}
                onClick={goNext}
                className="flex-1 py-3.5 rounded-[12px] bg-red text-white text-[14.5px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? "Creating…" : "Finish"}
              </button>
            </div>
          </div>
        )}

        {!signedUp && (
          <p className="text-center text-[13.5px] text-ink-soft mt-6">
            Already have a page?{" "}
            <Link to="/login" className="text-ink font-semibold underline">
              Log in
            </Link>
          </p>
        )}
      </div>
    </>
  );
}