const steps = [
  {
    n: "1",
    title: "Claim your page",
    desc: "Sign up, pick your username, add a photo and a short bio in Kreyòl, French, or English.",
  },
  {
    n: "2",
    title: "Add how you get paid",
    desc: "List your own MonCash, NatCash, PayPal, or bank details. Hatis never touches the money.",
  },
  {
    n: "3",
    title: "Share it everywhere",
    desc: "Drop your Hatis link in your TikTok bio, IG, or YouTube description. Fans support you directly.",
  },
];

export default function HowItWorks() {
  return (
    <section className="max-w-[1100px] mx-auto px-6 py-20">
      <h2 className="text-[clamp(28px,4vw,40px)] max-w-[16ch]">
        Get paid your way, without us in the middle.
      </h2>
      <p className="mt-3 text-[16px] text-ink-soft max-w-[48ch]">
        No custody, no conversion, no waiting on a payout schedule. Just a page that tells people
        how to support you.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="border border-border rounded-card p-5 bg-canvas-2">
            <div className="w-8 h-8 rounded-full bg-ink text-canvas flex items-center justify-center font-display font-bold text-sm mb-4">
              {s.n}
            </div>
            <h3 className="text-[17px] mb-1.5">{s.title}</h3>
            <p className="text-[14px] text-ink-soft leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}