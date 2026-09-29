import { useState } from "react";
import { addSocialLink, deleteSocialLink } from "../../data/manage";
import type { MySocialLink } from "../../data/manage";

interface Props {
  creatorId: string;
  socials: MySocialLink[];
  onChanged: () => Promise<void>;
  onError: (msg: string | null) => void;
}

interface PlatformConfig {
  name: string;
  domains: string[];
  prefix: string;
  placeholder: string;
}

const platforms: PlatformConfig[] = [
  { name: "Instagram", domains: ["instagram.com"], prefix: "https://www.instagram.com/", placeholder: "yourhandle" },
  { name: "TikTok", domains: ["tiktok.com"], prefix: "https://www.tiktok.com/@", placeholder: "yourhandle" },
  { name: "YouTube", domains: ["youtube.com", "youtu.be"], prefix: "https://www.youtube.com/@", placeholder: "yourchannel" },
  { name: "X", domains: ["x.com", "twitter.com"], prefix: "https://x.com/", placeholder: "yourhandle" },
  { name: "Facebook", domains: ["facebook.com", "fb.com"], prefix: "https://www.facebook.com/", placeholder: "yourpage" },
  { name: "Twitch", domains: ["twitch.tv"], prefix: "https://www.twitch.tv/", placeholder: "yourchannel" },
  { name: "GitHub", domains: ["github.com"], prefix: "https://github.com/", placeholder: "yourusername" },
  { name: "Behance", domains: ["behance.net"], prefix: "https://www.behance.net/", placeholder: "yourname" },
  { name: "Website", domains: [], prefix: "https://", placeholder: "yoursite.com" },
];

const MAX_LINKS = 9;
const handleRe = /^[A-Za-z0-9._-]{1,50}$/;

function hostMatches(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

function checkLink(
  cfg: PlatformConfig,
  raw: string
): { url: string; handle: string | null } | { error: string } {
  const v = raw.trim();
  if (!v) return { error: "Enter your handle or link." };

  const isWebsite = cfg.domains.length === 0;

  if (/^https?:\/\//i.test(v) || isWebsite) {
    const withProtocol = /^https?:\/\//i.test(v) ? v : `https://${v}`;
    let parsed: URL;
    try {
      parsed = new URL(withProtocol);
    } catch {
      return { error: "That link doesn't look right." };
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { error: "Links must start with https://" };
    }
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (!host.includes(".")) return { error: "That link doesn't look right." };
    if (!isWebsite && !cfg.domains.some((d) => hostMatches(host, d))) {
      return { error: `That doesn't look like a ${cfg.name} link.` };
    }
    return { url: parsed.toString(), handle: null };
  }

  const handle = v.replace(/^@/, "");
  if (!handleRe.test(handle)) {
    return { error: "Handles can use letters, numbers, dots, dashes and underscores." };
  }
  return { url: `${cfg.prefix}${handle}`, handle };
}

export default function SocialLinksSection({ creatorId, socials, onChanged, onError }: Props) {
  const available = platforms.filter((p) => !socials.some((s) => s.platform === p.name));
  const [platform, setPlatform] = useState(available[0]?.name ?? "");
  const [value, setValue] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selected = available.find((p) => p.name === platform) ?? available[0];

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;

    const result = checkLink(selected, value);
    if ("error" in result) {
      setFieldError(result.error);
      return;
    }

    setBusy(true);
    onError(null);
    try {
      await addSocialLink(creatorId, {
        platform: selected.name,
        handle: result.handle,
        url: result.url,
      });
      setValue("");
      setFieldError(null);
      await onChanged();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Couldn't add that link.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    onError(null);
    try {
      await deleteSocialLink(id);
      await onChanged();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Couldn't remove that link.");
    }
  }

  return (
    <section id="social" className="bg-canvas-2 border border-border rounded-card p-5 mb-6 scroll-mt-6">
      <h2 className="text-[15px] font-bold mb-1">Social links</h2>
      <p className="text-[13px] text-ink-soft mb-4">
        Show supporters where else to find you.
      </p>

      {socials.length > 0 && (
        <div className="flex flex-col gap-2 mb-5">
          {socials.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between bg-canvas border border-border rounded-card px-4 py-3"
            >
              <div className="min-w-0">
                <div className="text-[14px] font-semibold">{s.platform}</div>
                <div className="text-[13px] text-ink-soft truncate">
                  {s.url ?? "No link saved"}
                </div>
              </div>
              <button
                onClick={() => handleDelete(s.id)}
                className="text-[12.5px] font-semibold text-red hover:underline flex-none ml-3"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {socials.length >= MAX_LINKS || !selected ? (
        <p className="text-[13px] text-ink-soft">You've added every platform we support.</p>
      ) : (
        <form onSubmit={handleAdd} className="flex flex-col gap-2.5">
          <select
            value={selected.name}
            onChange={(e) => {
              setPlatform(e.target.value);
              setValue("");
              setFieldError(null);
            }}
            className="w-full bg-canvas border border-border rounded-[10px] px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
          >
            {available.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setFieldError(null);
            }}
            placeholder={selected.placeholder}
            className="w-full bg-canvas border border-border rounded-[10px] px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
          />
          <p className="text-[12px] px-1 -mt-1">
            {fieldError ? (
              <span className="text-red font-semibold">{fieldError}</span>
            ) : (
              <span className="text-ink-soft">Type your handle or paste the full link.</span>
            )}
          </p>
          <button
            type="submit"
            disabled={busy || !value.trim()}
            className="w-full py-2.5 rounded-[10px] bg-ink text-canvas text-[13.5px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy ? "Adding..." : "Add link"}
          </button>
        </form>
      )}
    </section>
  );
}
