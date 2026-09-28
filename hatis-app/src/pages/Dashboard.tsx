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

type PaymentType = PaymentMethod["type"];
type FieldKind = "haitiPhone" | "paypal" | "email" | "usContact" | "cashtag" | "text";

interface TypeConfig {
  label: string;
  kind: FieldKind;
  placeholder: string;
  help: string;
}

const typeConfigs: Record<PaymentType, TypeConfig> = {
  moncash: {
    label: "MonCash",
    kind: "haitiPhone",
    placeholder: "1234 5678",
    help: "Your MonCash number. We add +509 for you.",
  },
  natcash: {
    label: "NatCash",
    kind: "haitiPhone",
    placeholder: "1234 5678",
    help: "Your NatCash number. We add +509 for you.",
  },
  paypal: {
    label: "PayPal",
    kind: "paypal",
    placeholder: "you@email.com or paypal.me/yourname",
    help: "Use your PayPal email or your paypal.me link.",
  },
  zelle: {
    label: "Zelle",
    kind: "usContact",
    placeholder: "Email or US phone number",
    help: "The email or US phone number linked to your Zelle.",
  },
  payoneer: {
    label: "Payoneer",
    kind: "email",
    placeholder: "you@email.com",
    help: "The email on your Payoneer account.",
  },
  cashapp: {
    label: "Cash App",
    kind: "cashtag",
    placeholder: "yourcashtag",
    help: "Your $cashtag. We add the $ for you.",
  },
  bank: {
    label: "Bank transfer",
    kind: "text",
    placeholder: "Bank name, account number, account holder",
    help: "Whatever supporters need to send a transfer to you.",
  },
};

const typeOrder: PaymentType[] = [
  "moncash",
  "natcash",
  "paypal",
  "zelle",
  "payoneer",
  "cashapp",
  "bank",
];

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const paypalMeRe = /^(https?:\/\/)?(www\.)?paypal\.me\/[A-Za-z0-9._-]+\/?$/i;

function formatHaitiDigits(raw: string): string {
  let d = raw.replace(/\D/g, "");
  // If someone pastes a full number with the country code, drop the 509.
  if (d.startsWith("509") && d.length > 8) d = d.slice(3);
  d = d.slice(0, 8);
  return d.length > 4 ? `${d.slice(0, 4)} ${d.slice(4)}` : d;
}

// Cleans what the person types, depending on the kind of field.
function sanitize(kind: FieldKind, raw: string): string {
  if (kind === "haitiPhone") return formatHaitiDigits(raw);
  if (kind === "cashtag") return raw.replace(/[^A-Za-z0-9_]/g, "");
  return raw;
}

// Checks the value and returns the final text to save, or an error message.
function checkValue(kind: FieldKind, raw: string): { value: string } | { error: string } {
  const v = raw.trim();
  switch (kind) {
    case "haitiPhone": {
      const d = v.replace(/\D/g, "");
      if (d.length !== 8) return { error: "Enter your 8-digit Haitian number." };
      return { value: `+509 ${d.slice(0, 4)} ${d.slice(4)}` };
    }
    case "paypal": {
      if (emailRe.test(v)) return { value: v };
      if (paypalMeRe.test(v)) {
        return { value: /^https?:\/\//i.test(v) ? v : `https://${v}` };
      }
      return { error: "Enter your PayPal email or a paypal.me link." };
    }
    case "email":
      return emailRe.test(v) ? { value: v } : { error: "Enter a valid email address." };
    case "usContact": {
      if (emailRe.test(v)) return { value: v };
      let d = v.replace(/\D/g, "");
      if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
      if (d.length === 10) {
        return { value: `+1 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` };
      }
      return { error: "Enter an email or a 10-digit US phone number." };
    }
    case "cashtag":
      return v.length > 0
        ? { value: `$${v}` }
        : { error: "Enter your Cash App $cashtag." };
    case "text":
      return v.length >= 6
        ? { value: v }
        : { error: "Add a few more details (bank, account number, name)." };
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [type, setType] = useState<PaymentType>("moncash");
  const [value, setValue] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const config = typeConfigs[type];

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

  function handleTypeChange(next: PaymentType) {
    setType(next);
    setValue("");
    setFieldError(null);
  }

  function handleValueChange(raw: string) {
    setValue(sanitize(config.kind, raw));
    setFieldError(null);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!creatorId) return;

    const result = checkValue(config.kind, value);
    if ("error" in result) {
      setFieldError(result.error);
      return;
    }

    setAdding(true);
    setErrorMsg(null);
    try {
      await addPaymentMethod(creatorId, {
        type,
        label: config.label,
        value: result.value,
      });
      setValue("");
      setFieldError(null);
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
                    <div className="text-[13px] text-ink-soft break-all">{pm.value}</div>
                  </div>
                  <div className="flex gap-2 flex-none ml-3">
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
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as PaymentType)}
              className="w-full bg-canvas border border-border rounded-[10px] px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
            >
              {typeOrder.map((t) => (
                <option key={t} value={t}>
                  {typeConfigs[t].label}
                </option>
              ))}
            </select>

            {config.kind === "text" ? (
              <textarea
                value={value}
                onChange={(e) => handleValueChange(e.target.value)}
                placeholder={config.placeholder}
                rows={3}
                className="w-full bg-canvas border border-border rounded-[10px] px-3 py-2.5 text-[13.5px] outline-none focus:border-ink resize-none"
              />
            ) : (
              <div className="flex items-center bg-canvas border border-border rounded-[10px] px-3 focus-within:border-ink">
                {config.kind === "haitiPhone" && (
                  <span className="text-[13.5px] font-semibold text-ink-soft mr-2">+509</span>
                )}
                {config.kind === "cashtag" && (
                  <span className="text-[13.5px] font-semibold text-ink-soft mr-1">$</span>
                )}
                <input
                  value={value}
                  onChange={(e) => handleValueChange(e.target.value)}
                  placeholder={config.placeholder}
                  inputMode={config.kind === "haitiPhone" ? "tel" : undefined}
                  className="flex-1 bg-transparent py-2.5 text-[13.5px] outline-none"
                />
              </div>
            )}

            <p className="text-[12px] px-1 -mt-1">
              {fieldError ? (
                <span className="text-red font-semibold">{fieldError}</span>
              ) : (
                <span className="text-ink-soft">{config.help}</span>
              )}
            </p>

            <button
              type="submit"
              disabled={adding || !value.trim()}
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