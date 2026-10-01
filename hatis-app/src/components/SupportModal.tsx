import { useEffect, useState } from "react";
import { X, Copy, Check, ExternalLink, Heart } from "lucide-react";
import paymentMeta from "../lib/paymentMeta";
import { recordSupportClick } from "../data/creators";
import type { PaymentMethod } from "../types/creator";

interface Props {
  creatorId: string;
  creatorName: string;
  paymentMethods: PaymentMethod[];
  onClose: () => void;
}

export default function SupportModal({
  creatorId,
  creatorName,
  paymentMethods,
  onClose,
}: Props) {
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [copied, setCopied] = useState(false);
  const [clickRecorded, setClickRecorded] = useState(false);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleSelect(pm: PaymentMethod) {
    setSelected(pm);
    setCopied(false);
    if (!clickRecorded) {
      setClickRecorded(true);
      try {
        await recordSupportClick(creatorId);
      } catch {
        // Not critical if this fails silently — don't block the support flow.
      }
    }
  }

  async function handleCopy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard permissions can fail — the value is still visible on screen.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const firstName = creatorName.split(" ")[0];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-ink/60" />

      <div
        className="relative w-full sm:max-w-md bg-canvas rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-canvas px-6 pt-6 pb-4 border-b border-border z-10">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-2 text-ink-soft hover:text-ink hover:bg-canvas-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-5 h-5 text-red" fill="currentColor" />
            <h2 className="text-[17px] font-bold">
              {selected ? "Send your support" : `Show love to ${firstName}`}
            </h2>
          </div>
          <p className="text-[13.5px] text-ink-soft">
            {selected ? `You're supporting ${creatorName}` : "Choose the way that works best for you."}
          </p>
        </div>

        <div className="p-6">
          {!selected ? (
            <>
              {paymentMethods.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-ink-soft text-[14px]">
                    {creatorName} hasn't added support methods yet.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {paymentMethods.map((pm) => {
                    const meta = paymentMeta[pm.type];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={pm.id}
                        onClick={() => handleSelect(pm)}
                        className="w-full flex items-center gap-3 p-4 rounded-card border border-border hover:border-ink hover:bg-canvas-2 transition-all text-left"
                      >
                        <span
                          className={`w-11 h-11 rounded-xl ${meta.bgColor} flex items-center justify-center flex-none`}
                        >
                          <Icon className={`w-5 h-5 ${meta.color}`} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[14.5px]">{pm.label}</p>
                          <p className="text-[13px] text-ink-soft truncate">{meta.description}</p>
                        </div>
                        <span className="text-ink-soft">&rarr;</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 p-3 bg-canvas-2 rounded-xl">
                <p className="text-[12px] text-ink-soft text-center leading-relaxed">
                  Hatis never handles your payment. You support the creator directly through
                  their own account.
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setSelected(null)}
                className="text-[13.5px] text-ink-soft hover:text-ink transition-colors flex items-center gap-1 self-start"
              >
                &larr; All methods
              </button>

              {(() => {
                const meta = paymentMeta[selected.type];
                const Icon = meta.icon;
                const link = meta.link(selected.value);
                return (
                  <>
                    <div className={`p-4 rounded-xl ${meta.bgColor}`}>
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-lg bg-canvas flex items-center justify-center flex-none">
                          <Icon className={`w-5 h-5 ${meta.color}`} />
                        </span>
                        <div>
                          <p className="font-semibold text-[14.5px]">{selected.label}</p>
                          <p className="text-[13px] text-ink-soft">{meta.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border border-border rounded-xl">
                      <p className="text-[11px] font-semibold text-ink-soft uppercase tracking-wide mb-2">
                        {selected.label}
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        <code className="text-[16px] font-semibold break-all">
                          {selected.value}
                        </code>
                        <button
                          onClick={() => handleCopy(selected.value)}
                          className="flex-none px-3 py-2 bg-ink text-canvas text-[13px] font-semibold rounded-lg flex items-center gap-1.5"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" /> Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-canvas-2 rounded-xl">
                      <p className="text-[13.5px] text-ink-soft leading-relaxed">
                        {meta.instructions(firstName)}
                      </p>
                    </div>

                    {link && (
                      <button
                        onClick={() => window.open(link, "_blank", "noopener,noreferrer")}
                        className="w-full py-3.5 bg-ink text-canvas font-semibold rounded-xl flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" /> Open {selected.label}
                      </button>
                    )}

                    {copied && (
                      <div className="p-3 bg-teal/10 rounded-xl flex items-center gap-2">
                        <Check className="w-4 h-4 text-teal flex-none" />
                        <p className="text-[13.5px] text-teal">
                          Copied. Open your app, send your support, then come back to discover
                          another creator.
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}