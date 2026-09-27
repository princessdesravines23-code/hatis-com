import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import { supabase } from "../lib/supabase";
import {
  getMyCreator,
  addPaymentMethod,
  deletePaymentMethod,
  setPrimaryPaymentMethod,
} from "../data/creators";
import type { Creator, PaymentMethod } from "../types/creator";

const paymentTypes: { value: PaymentMethod["type"]; label: string }[] = [
  { value: "moncash", label: "MonCash" },
  { value: "natcash", label: "NatCash" },
  { value: "paypal", label: "PayPal" },
  { value: "zelle", label: "Zelle" },
  { value: "payoneer", label: "Payoneer" },
  { value: "cashapp", label: "Cash App" },
  { value: "bank", label: "Bank transfer" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [type, setType] = useState<PaymentMethod["type"]>("moncash");
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [adding, setAdding] = useState(false);

  async function load() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }

    const result = await getMyCreator();
    if (!result) {
      navigate("/become-creator");
      return;
    }
    setCreatorId(result.id);
    setCreator(result.creator);
    setLoading(false);
  }

  useEffect(() => {
    load().catch((err) => {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    });
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!creatorId || !label.trim() || !value.trim()) return;
    setAdding(true);
    setErrorMsg(null);
    try {
      await addPaymentMethod(creatorId, { type, label: label.trim(), value: value.trim() });
      setLabel("");
      setValue("");
      await load();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Couldn't add that payment method.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    setErrorMsg(null);
    try {
      await deletePaymentMethod(id);
      await load();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Couldn't remove that payment method.");
    }
  }

  async function handleSetPrimary(id: string) {
    if (!creatorId) return;
    setErrorMsg(null);
    try {
      await setPrimaryPaymentMethod(creatorId, id);
      await load();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Couldn't update your primary method.");
    }
  }

  if (loading) {
    return (
      <>
        <Nav />
        <div className="max-w-[720px] mx-auto px-6 py-20 text-center text-ink-soft">Loading...</div>
      </>
    );
  }

  if (!creator) return null;

  return (
    <>
      <Nav />
      <div className="max-w-[720px] mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[clamp(24px,3.5vw,30px)]">Your dashboard</h1>
            <p className="text-[14px] text-ink-soft mt-1">
              Managing{" "}
              <Link to={`/${creator.slug}`} className="text-ink font-semibold underline">
                hatis.app/{creator.slug}
              </Link>
            </p>
          </div>
        </div>

        {errorMsg && (
          <p className="text-[13px] text-red font-medium bg-red/10 border border-red/20 rounded-[10px] px-3.5 py-2.5 mb-5">
            {errorMsg}
          </p>
        )}

        <section className="bg-canvas-2 border border-border rounded-card p-5 mb-6">
          <h2 className="text-[15px] font-bold mb-1">Payment methods</h2>
          <p className="text-[13px] text-ink-soft mb-4">
            These show on your public page so supporters know how to send you money directly.
            Hatis never touches or processes these payments.
          </p>

          {creator.paymentMethods.length === 0 ? (
            <p className="text-[13.5px] text-ink-soft mb-4">
              You haven't added any payment methods yet — add one below.
            </p>
          ) : (
            <div className="flex flex-col gap-2 mb-5">
              {creator.paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className="flex items-center justify-between bg-canvas border border-border rounded-card px-4 py-3"
                >
                  <div>
                    <div className="text-[14px] font-semibold flex items-center gap-2">
                      {pm.label}
                      {pm.isPrimary && (
                        <span className="text-[11px] font-bold text-teal bg-teal/10 px-2 py-0.5 rounded-pill">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="text-[13px] text-ink-soft">{pm.value}</div>
                  </div>
                  <div className="flex gap-2">
                    {!pm.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(pm.id)}
                        className="text-[12.5px] font-semibold text-ink-soft hover:text-ink underline"
                      >
                        Make primary
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(pm.id)}
                      className="text-[12.5px] font-semibold text-red hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAdd} className="flex flex-col gap-2.5">
            <div className="flex gap-2.5">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PaymentMethod["type"])}
                className="bg-canvas border border-border rounded-[10px] px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
              >
                {paymentTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Label (e.g. MonCash)"
                className="flex-1 bg-canvas border border-border rounded-[10px] px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
              />
            </div>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Handle, number, or email (e.g. +509 1234 5678 or you@email.com)"
              className="w-full bg-canvas border border-border rounded-[10px] px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
            />
            <button
              type="submit"
              disabled={adding || !label.trim() || !value.trim()}
              className="w-full py-2.5 rounded-[10px] bg-ink text-canvas text-[13.5px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {adding ? "Adding..." : "Add payment method"}
            </button>
          </form>
        </section>
      </div>
    </>
  );
}