import { useState } from "react";
import Nav from "../components/Nav";
import CategoryChips from "../components/CategoryChips";
import CreatorCard from "../components/CreatorCard";
import HowItWorks from "../components/HowItWorks";
import Faq from "../components/Faq";
import ClaimFooter from "../components/ClaimFooter";
import { creators } from "../data/creators";

export default function Catalogue() {
  const [active, setActive] = useState("All");
  const list = active === "All" ? creators : creators.filter((c) => c.cats.includes(active));

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

      <CategoryChips active={active} onChange={setActive} />

      <div className="max-w-[1100px] mx-auto px-6 mt-8 mb-4 grid gap-4 grid-cols-[repeat(auto-fill,minmax(230px,1fr))]">
        {list.map((c) => (
          <CreatorCard key={c.slug} creator={c} newTab />
        ))}
      </div>

      <HowItWorks />
      <Faq />
      <ClaimFooter />
    </>
  );
}