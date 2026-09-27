import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import CategoryChips from "../components/CategoryChips";
import CreatorCard from "../components/CreatorCard";
import HowItWorks from "../components/HowItWorks";
import Faq from "../components/Faq";
import ClaimFooter from "../components/ClaimFooter";
import { useCreators } from "../hooks/useCreators";

export default function Catalogue() {
  const { creators, loading, error } = useCreators();
  const [active, setActive] = useState<string | null>(null);

  const categories = Array.from(new Set(creators.flatMap((c) => c.cats))).sort();

  useEffect(() => {
    if (!active && categories.length > 0) setActive(categories[0]);
  }, [categories, active]);

  const list = active ? creators.filter((c) => c.cats.includes(active)) : [];

  return (
    <>
      <Nav />
      <div className="max-w-[1100px] mx-auto px-6 pt-10 pb-2">
        <h1 className="text-[clamp(34px,5.5vw,58px)] leading-[1.02] max-w-[11ch]">
          Support the artists building Haitian culture.
        </h1>
        <p className="mt-3.5 text-[17px] text-ink-soft max-w-[42ch] leading-relaxed">
          Musicians, comedians, developers, and creators — one place for the diaspora and the
          island to show up for them directly.
        </p>
      </div>

      {active && (
        <CategoryChips categories={categories} active={active} onChange={setActive} />
      )}

      <div className="max-w-[1100px] mx-auto px-6 mt-8 mb-4">
        {loading && <p className="text-ink-soft text-[14px]">Loading creators…</p>}
        {error && <p className="text-red text-[14px]">Couldn't load creators: {error}</p>}
        {!loading && !error && (
          <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(230px,1fr))]">
            {list.map((c) => (
              <CreatorCard key={c.slug} creator={c} newTab />
            ))}
          </div>
        )}
      </div>

      <HowItWorks />
      <Faq />
      <ClaimFooter />
    </>
  );
}
