import { useState } from "react";
import { addTier, deleteTier, updateTier } from "../../data/manage";
import type { MyTier } from "../../data/manage";

interface Props {
  creatorId: string;
  tiers: MyTier[];
  onChanged: () => Promise<void>;
  onError: (msg: string | null) => void;
}

type Currency = "USD" | "HTG";

const MAX_TIERS = 6;
const MAX_AMOUNT: Record<Currency, number> = { USD: 1000, HTG: 200000 };

function formatPrice(amount: number, currency: Currency): string {
  const n = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  return currency === "USD" ? `$${n}/mo` : `${n} HTG/mo`;
}

function parsePriceLabel(label: string): { amount: string; currency: Currency } {
  const usd = label.match(/^\$(\d+(?:\.\d{1,2})?)\/mo$/);
  if (usd) return { amount: usd[1], currency: "USD" };
  const htg = label.match(/^(\d+(?:\.\d{1,2})?) HTG\/mo$/);
  if (htg) return { amount: htg[1], currency: "HTG" };
  return { amount: "", currency: "USD" };
}

export default function TiersSection({ creatorId, tiers, onChanged, onError }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [description, setDescription] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const atLimit = tiers.length >= MAX_TIERS && editingId === null;

  function resetForm() {
    setEditingId(null);
    setName("");
    setAmount("");
    setCurrency("USD");
    setDescription("");
    setFieldError(null);
  }

  function startEdit(tier: MyTier) {
    const parsed = parsePriceLabel(tier.priceLabel);
    setEditingId(tier.id);
    setName(tier.name);
    setAmount(parsed.amount);
    setCurrency(parsed.currency);
    setDescription(tier.description);
    setFieldError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setFieldError("Give your tier a name.");
      return;
    }
    const value = Number(amount);
    if (!amount || !Number.isFinite(value) || value <= 0) {
      setFieldError("Enter a price above 0.");
      return;
    }
    if (value > MAX_AMOUNT[currency]) {
      setFieldError(`The most you can charge is ${MAX_AMOUNT[currency]} ${currency}.`);
      return;
    }

    const input = {
      name: cleanName,
      priceLabel: formatPrice(value, currency),
      description: description.trim(),
    };

    setBusy(true);
    onError(null);
    try {
      if (editingId) {
        await updateTier(editingId, input);
      } else {
        const nextOrder = tiers.reduce((max, t) => Math.max(max, t.displayOrder), 0) + 1;
        await addTier(creatorId, { ...input, displayOrder: nextOrder });
      }
      resetForm();
      await onChanged();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Couldn't save that tier.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(tier: MyTier) {
    if (!window.confirm(`Delete "${tier.name}"? This can't be undone.`)) return;
    onError(null);
    try {
      await deleteTier(tier.id);
      if (editingId === tier.id) resetForm();
      await onChanged();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Couldn't delete that tier.");
    }
  }

  return (
    <section id="tiers" className="bg-canvas-2 border border-border rounded-card p-5 mb-6 scroll-mt-6">
      <h2 className="text-[15px] font-bold mb-1">Membership tiers</h2>
      <p className="text-[13px] text-ink-soft mb-4">
        Monthly levels supporters can choose from. Add up to {MAX_TIERS}.
      </p>

      {tiers.length > 0 && (
        <div className="flex flex-col gap-2 mb-5">
          {tiers.map((t) => (
            <div
              key={t.id}
              className={`bg-canvas border rounded-card px-4 py-3 ${
                editingId === t.id ? "border-ink" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold">
                    {t.name} <span className="text-red font-bold">· {t.priceLabel}</span>
                  </div>
                  {t.description && (
                    <div className="text-[13px] text-ink-soft mt-1 break-words">{t.description}</div>
                  )}
                </div>
                <div className="flex gap-3 flex-none">
                  <button
                    onClick={() => startEdit(t)}
                    className="text-[12.5px] font-semibold text-ink-soft hover:text-ink underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t)}
                    className="text-[12.5px] font-semibold text-red hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {atLimit ? (
        <p className="text-[13px] text-ink-soft">
          You've reached {MAX_TIERS} tiers. Edit or delete one to make room.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          <p className="text-[12.5px] font-semibold text-ink-soft">
            {editingId ? "Edit tier" : "Add a tier"}
          </p>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFieldError(null);
            }}
            placeholder="Tier name (e.g. Fanmi)"
            maxLength={40}
            className="w-full bg-canvas border border-border rounded-[10px] px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
          />
          <div className="flex gap-2">
            <input
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value.replace(/[^0-9.]/g, ""));
                setFieldError(null);
              }}
              inputMode="decimal"
              placeholder="Price per month"
              className="flex-1 bg-canvas border border-border rounded-[10px] px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
            />
            <select
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value as Currency);
                setFieldError(null);
              }}
              className="bg-canvas border border-border rounded-[10px] px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
            >
              <option value="USD">USD</option>
              <option value="HTG">HTG</option>
            </select>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 240))}
            rows={3}
            placeholder="What do supporters get at this level?"
            className="w-full bg-canvas border border-border rounded-[10px] px-3 py-2.5 text-[13.5px] outline-none focus:border-ink resize-none"
          />
          <p className="text-[12px] px-1 -mt-1">
            {fieldError ? (
              <span className="text-red font-semibold">{fieldError}</span>
            ) : (
              <span className="text-ink-soft">{description.length}/240</span>
            )}
          </p>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="flex-1 py-2.5 rounded-[10px] bg-ink text-canvas text-[13.5px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {busy ? "Saving..." : editingId ? "Save changes" : "Add tier"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-[10px] border border-border text-[13.5px] font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
