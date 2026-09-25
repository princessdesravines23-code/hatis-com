import { useState } from "react";
import Nav from "../components/Nav";

export default function BecomeCreator() {
  const [username, setUsername] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <Nav />
      <div className="max-w-[560px] mx-auto px-6 py-20 text-center">
        <h1 className="text-[clamp(30px,5vw,44px)] leading-[1.05]">
          Claim your page before someone else does.
        </h1>
        <p className="mt-4 text-[16px] text-ink-soft leading-relaxed">
          Signup isn't open yet — we're onboarding creators by hand while we finish the payment
          setup. Drop your name below and we'll reach out when it's your turn.
        </p>

        {submitted ? (
          <p className="mt-8 text-[15px] font-semibold text-teal">
            Got it — we'll be in touch soon.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="mt-8 flex rounded-pill bg-canvas-2 border border-border overflow-hidden max-w-[420px] mx-auto"
          >
            <span className="pl-5 py-3.5 text-[14px] text-ink-soft flex items-center">
              hatis.app/
            </span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yourname"
              required
              className="flex-1 bg-transparent outline-none text-ink text-[14px] py-3.5 pr-2"
            />
            <button className="bg-red text-white px-5 font-bold text-[14px] flex-none">
              Notify me
            </button>
          </form>
        )}
      </div>
    </>
  );
}