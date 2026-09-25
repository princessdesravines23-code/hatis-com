import { useState } from "react";

const faqs = [
  {
    q: "What is Hatis?",
    a: "A page for Haitian creators — musicians, comedians, artists, developers, streamers — to share how fans can support them directly, in one link.",
  },
  {
    q: "Does Hatis hold or move my money?",
    a: "No. You list your own MonCash, NatCash, PayPal, or bank details on your profile. Supporters pay you directly through whichever method you choose — Hatis is never in that transaction.",
  },
  {
    q: "Does Hatis take a fee?",
    a: "The free plan is free. A paid plan will unlock a custom domain, analytics, and removing Hatis branding — but core profiles stay free.",
  },
  {
    q: "Can I use Hatis if I'm just starting out?",
    a: "Yes — there's no follower minimum. If you make something and want a simple way for people to support you, you're welcome here.",
  },
  {
    q: "How do I prove it's really me?",
    a: "You post a short one-time code on your existing Instagram, TikTok, or YouTube for us to confirm, then it's removed. No ID, no paperwork.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="max-w-[720px] mx-auto px-6 py-16">
      <h2 className="text-[clamp(26px,3.5vw,34px)] mb-8 text-center">Questions, answered</h2>
      <div className="flex flex-col gap-2.5">
        {faqs.map((f, i) => (
          <div key={f.q} className="border border-border rounded-card bg-canvas-2 overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <span className="font-semibold text-[15px] pr-4">{f.q}</span>
              <span className="text-lg text-ink-soft flex-none">{open === i ? "–" : "+"}</span>
            </button>
            {open === i && (
              <p className="px-5 pb-4 text-[14px] text-ink-soft leading-relaxed">{f.a}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}