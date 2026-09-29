import { useEffect, useState } from "react";
import { categories } from "../../data/creators";
import { removeAvatar, updateProfile, uploadAvatar } from "../../data/manage";
import type { MyProfile } from "../../data/manage";

interface Props {
  profile: MyProfile;
  onChanged: () => Promise<void>;
  onError: (msg: string | null) => void;
}

const MAX_BIO = 280;
const MAX_PHOTO_MB = 5;

function titleCase(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ProfileSection({ profile, onChanged, onError }: Props) {
  const [name, setName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);
  const [interests, setInterests] = useState<string[]>(profile.interests);
  const [custom, setCustom] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);

  const interestsKey = profile.interests.join("|");

  useEffect(() => {
    setName(profile.displayName);
    setBio(profile.bio);
    setInterests(profile.interests);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.displayName, profile.bio, interestsKey]);

  const allChips = Array.from(new Set([...categories, ...interests]));

  const dirty =
    name.trim() !== profile.displayName ||
    bio.trim() !== profile.bio ||
    interests.join("|") !== interestsKey;

  const canSave = dirty && name.trim().length > 0 && interests.length >= 1 && !saving;

  function toggleInterest(cat: string) {
    setSaved(false);
    setInterests((prev) => {
      if (prev.includes(cat)) {
        return prev.length > 1 ? prev.filter((i) => i !== cat) : prev;
      }
      return [...prev, cat];
    });
  }

  function addCustomInterest() {
    const value = titleCase(custom).slice(0, 24);
    if (!value) return;
    setSaved(false);
    const existing = allChips.find((c) => c.toLowerCase() === value.toLowerCase());
    const finalValue = existing ?? value;
    setInterests((prev) => (prev.includes(finalValue) ? prev : [...prev, finalValue]));
    setCustom("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setSaved(false);
    onError(null);
    try {
      await updateProfile(profile.id, {
        displayName: name.trim(),
        bio: bio.trim(),
        interests,
      });
      await onChanged();
      setSaved(true);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Couldn't save your profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      onError(`That photo is too large. Keep it under ${MAX_PHOTO_MB} MB.`);
      return;
    }

    setPhotoBusy(true);
    onError(null);
    try {
      await uploadAvatar(profile.userId, profile.id, file);
      await onChanged();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Couldn't upload that photo.");
    } finally {
      setPhotoBusy(false);
    }
  }

  async function handleRemovePhoto() {
    setPhotoBusy(true);
    onError(null);
    try {
      await removeAvatar(profile.id);
      await onChanged();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Couldn't remove your photo.");
    } finally {
      setPhotoBusy(false);
    }
  }

  return (
    <section className="bg-canvas-2 border border-border rounded-card p-5 mb-6">
      <h2 className="text-[15px] font-bold mb-1">Your profile</h2>
      <p className="text-[13px] text-ink-soft mb-5">
        This is what supporters see at the top of your page.
      </p>

      <div className="flex items-center gap-4 mb-5">
        <div
          className="w-[84px] h-[84px] rounded-full border-4 border-canvas shadow-lg flex items-center justify-center font-display font-bold text-2xl text-canvas overflow-hidden flex-none"
          style={{
            background: profile.avatarUrl
              ? undefined
              : `linear-gradient(135deg, ${profile.c1}, ${profile.c2})`,
          }}
        >
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            profile.initials
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            className={`text-[13px] font-semibold underline cursor-pointer ${
              photoBusy ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {photoBusy ? "Working…" : profile.avatarUrl ? "Change photo" : "Add a photo"}
            <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </label>
          {profile.avatarUrl && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={photoBusy}
              className="self-start text-[12.5px] font-semibold text-red hover:underline disabled:opacity-50"
            >
              Remove photo
            </button>
          )}
          <span className="text-[12px] text-ink-soft">JPG or PNG, up to {MAX_PHOTO_MB} MB.</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-3.5">
        <div>
          <label className="text-[12.5px] font-semibold text-ink-soft">Display name</label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            maxLength={60}
            className="w-full mt-1 bg-canvas border border-border rounded-[10px] px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
          />
          <p className="text-[12px] text-ink-soft mt-1">
            Your link stays hatis.app/{profile.username} even if you change your name.
          </p>
        </div>

        <div>
          <label className="text-[12.5px] font-semibold text-ink-soft">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => {
              setBio(e.target.value.slice(0, MAX_BIO));
              setSaved(false);
            }}
            rows={5}
            placeholder="Tell supporters who you are and what you make."
            className="w-full mt-1 bg-canvas border border-border rounded-[10px] px-3 py-2.5 text-[13.5px] outline-none focus:border-ink resize-none"
          />
          <p className="text-[12px] text-ink-soft mt-1 text-right">
            {bio.length}/{MAX_BIO}
          </p>
        </div>

        <div>
          <label className="text-[12.5px] font-semibold text-ink-soft">Interests</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {allChips.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleInterest(cat)}
                className={`px-3.5 py-1.5 rounded-pill border text-[13px] font-semibold transition-colors ${
                  interests.includes(cat)
                    ? "bg-ink text-canvas border-ink"
                    : "bg-canvas text-ink-soft border-border hover:border-ink"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomInterest();
                }
              }}
              placeholder="Don't see yours? Add it (e.g. Dancer)"
              maxLength={24}
              className="flex-1 bg-canvas border border-border rounded-[10px] px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
            />
            <button
              type="button"
              onClick={addCustomInterest}
              disabled={!custom.trim()}
              className="px-4 rounded-[10px] border border-border text-[13px] font-semibold disabled:opacity-40"
            >
              Add
            </button>
          </div>
          <p className="text-[12px] text-ink-soft mt-2">
            Pick at least 1. "{interests[0]}" is your main category.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSave}
            className="px-5 py-2.5 rounded-[10px] bg-ink text-canvas text-[13.5px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
          {saved && !dirty && <span className="text-[13px] font-semibold text-teal">Saved</span>}
        </div>
      </form>
    </section>
  );
}
