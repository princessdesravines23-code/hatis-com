import { useState } from "react";
import { Link } from "react-router-dom";

export default function ClaimFooter() {
  const [username, setUsername] = useState("");

  return (
    <>
      <section className="bg-indigo text-canvas">
        <div className="max-w-[1100px] mx-auto px-6 py-20 text-center">
          <h2 className="text-[clamp(28px,4.5vw,42px)] text-canvas">
            Your page, your name, your rules.
          </h2>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-8 max-w-[420px] mx-auto flex rounded-pill bg-canvas overflow-hidden border border-white/10"
          >
            <span className="pl-5 py-3.5 text-[14px] text-ink-soft flex items-center">
              hatis.app/
            </span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yourname"
              className="flex-1 bg-transparent outline-none text-ink text-[14px] py-3.5 pr-2"
            />
            <Link
              to="/become-creator"
              className="bg-red text-white px-5 font-bold text-[14px] flex-none flex items-center"
            >
              Claim
            </Link>
          </form>
        </div>
      </section>

      <footer className="bg-ink text-canvas/70">
        <div className="max-w-[1100px] mx-auto px-6 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8 text-[13.5px]">
          <div>
            <Link to="/" className="text-canvas font-display font-bold text-lg mb-3 block">
              Hat<span className="text-red">is</span>
            </Link>
            <p className="text-[12.5px] leading-relaxed max-w-[22ch]">
              Support for the artists building Haitian culture, everywhere they are.
            </p>
          </div>
          <div>
            <div className="text-canvas font-semibold mb-2.5">Platform</div>
            <ul className="flex flex-col gap-2">
              <li><a href="/#how-it-works" className="hover:text-canvas">How it works</a></li>
              <li><Link to="/become-creator" className="hover:text-canvas">Become a creator</Link></li>
              <li><Link to="/" className="hover:text-canvas">Browse creators</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-canvas font-semibold mb-2.5">Support</div>
            <ul className="flex flex-col gap-2">
              <li><a href="mailto:hello@hatis.app" className="hover:text-canvas">Help</a></li>
              <li><a href="mailto:hello@hatis.app" className="hover:text-canvas">Contact</a></li>
              <li><a href="/#faq" className="hover:text-canvas">FAQ</a></li>
            </ul>
          </div>
          <div>
            <div className="text-canvas font-semibold mb-2.5">Legal</div>
            <ul className="flex flex-col gap-2">
              <li><Link to="/terms" className="hover:text-canvas">Terms</Link></li>
              <li><Link to="/privacy" className="hover:text-canvas">Privacy</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}