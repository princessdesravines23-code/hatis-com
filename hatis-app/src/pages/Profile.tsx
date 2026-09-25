import { Link, useParams } from "react-router-dom";
import Nav from "../components/Nav";
import { creators } from "../data/creators";

export default function Profile() {
  const { slug } = useParams();
  const creator = creators.find((c) => c.slug === slug);

  if (!creator) {
    return (
      <>
        <Nav />
        <div className="max-w-[1100px] mx-auto px-6 py-20 text-center text-ink-soft">
          <p>No creator found at this address.</p>
          <Link to="/" className="text-red font-semibold">
            Back to all creators
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav />
      <div className="max-w-[1100px] mx-auto px-6 pt-4">
        <Link to="/" className="text-sm font-semibold text-ink-soft">
          &larr; All creators
        </Link>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 mt-3.5">
        <div
          className="h-40 rounded-[22px] relative overflow-hidden"
          style={{ background: `linear-gradient(120deg, ${creator.c1} 0%, ${creator.c2} 100%)` }}
        />
      </div>

      <div className="max-w-[1100px] mx-auto px-6 flex items-end gap-4 -mt-[38px]">
        <div
          className="w-[88px] h-[88px] rounded-[20px] border-4 border-canvas flex items-center justify-center font-display font-bold text-3xl text-canvas"
          style={{ background: `linear-gradient(135deg, ${creator.c1}, ${creator.c2})` }}
        >
          {creator.initials}
        </div>
        <div className="pb-1.5 flex-1">
          <h2 className="text-2xl">{creator.name}</h2>
          <div className="text-[13px] text-ink-soft mt-1">{creator.cats.join(" · ")}</div>
        </div>
        <div className="pb-1.5 flex gap-2">
          <button className="border border-border px-4.5 py-2.5 rounded-pill text-sm font-semibold">
            Follow
          </button>
          <button className="bg-red text-white px-5 py-2.5 rounded-pill text-sm font-bold">
            Support
          </button>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 mt-8 mb-20 grid grid-cols-1 md:grid-cols-[1.1fr_1.4fr] gap-5">
        <div>
          <div className="bg-canvas-2 border border-border rounded-card p-5 mb-4">
            <h3 className="text-[13px] text-ink-soft font-semibold mb-2.5">About</h3>
            <p className="text-[14.5px] leading-relaxed">{creator.bio}</p>
            <div className="flex gap-2.5 mt-3.5 flex-wrap">
              {creator.socials.map((s) => (
                <span
                  key={s}
                  className="text-[12.5px] font-semibold px-3 py-1.5 rounded-pill bg-canvas border border-border"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-canvas-2 border border-border rounded-card p-5">
            <h3 className="text-[13px] text-ink-soft font-semibold mb-2.5">Supporters</h3>
            <p className="text-[14.5px]">
              {creator.supporters} people support {creator.name.split(" ")[0]} right now.
            </p>
          </div>
        </div>

        <div className="bg-canvas-2 border border-border rounded-card p-5">
          <h3 className="text-[13px] text-ink-soft font-semibold mb-2.5">Membership tiers</h3>
          {creator.tiers.map((t) => (
            <div key={t.name} className="border border-border rounded-2xl p-4 mb-3 bg-canvas">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[15px]">{t.name}</span>
                <span className="font-bold text-[15px] text-red">{t.price}</span>
              </div>
              <p className="text-[13.5px] text-ink-soft mt-1.5 leading-relaxed">{t.desc}</p>
              <button className="mt-3 w-full py-2.5 rounded-[10px] bg-ink text-canvas text-[13.5px] font-bold">
                Join {t.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
