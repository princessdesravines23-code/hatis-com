import { useEffect, useState } from "react";
import type { PaymentMethod } from "../types/creator";

interface Props {
  creatorName: string;
  paymentMethods: PaymentMethod[];
  onClose: () => void;
}

interface MethodInfo {
  description: string;
  howTo: (name: string) => string;
}

const methodInfo: Record<PaymentMethod["type"], MethodInfo> = {
  moncash: {
    description: "Mobile payment popular in Haiti",
    howTo: (name) => `Open your MonCash app, enter the number above, and send your support to ${name}.`,
  },
  natcash: {
    description: "National Cash mobile transfer",
    howTo: (name) => `Open your NatCash app, enter the number above, and send your support to ${name}.`,
  },
  paypal: {
    description: "Pay online with PayPal",
    howTo: () => "Opens PayPal so you can send your support directly.",
  },
  zelle: {
    description: "Send through your bank app",
    howTo: () => "Zelle is sent through your bank's mobile app. Open your banking app, find Zelle, and send to the email or phone above.",
  },
  payoneer: {
    description: "International payment platform",
    howTo: () => "Open Payoneer and send your support to the email above.",
  },
  cashapp: {
    description: "Send money with Cash App",
    howTo: () => "Open Cash App and send your support to the $cashtag above.",
  },
  bank: {
    description: "Direct bank transfer",
    howTo: () => "Use these details in your bank's transfer or wire feature.",
  },
};

function externalLink(pm: PaymentMethod): string | null {
  return /^https?:\/\//i.test(pm.value) ? pm.value : null;
}

export default function SupportModal({ creatorName, paymentMethods, onClose }: Props) {
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [copied, setCopied] = useState(false);
  const firstName = creatorName.split(" ")[0];

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

  async function handleCopy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard can fail on some browsers/permissions — the visible text is the fallback.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-ink/60" />

      <div
        className="relative w-full sm:max-w-[420px] bg-canvas rounded-t-3xl sm:rounded-card shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-canvas px-6 pt-6 pb-4 border-b border-border z-10">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-1.5 text-ink-soft hover:text-ink"
          >
            ✕
          </button>
          <h2 className="text-[17px] font-bold flex items-center gap-2">
            <span className="text-red">♥</span>
            {selected ? "Send your support" : `Show ${firstName} some love`}
          </h2>
          <p className="text-[13px] text-ink-soft mt-1">
            {selected ? `You're supporting ${creatorName}` : "Choose the way that works best for you."}
          </p>
        </div>

        <div className="p-6">
          {!selected ? (
            <>
              {paymentMethods.length === 0 ? (
                <p className="text-[13.5px] text-ink-soft text-center py-8">
                  {creatorName} hasn't added a payment method yet.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {paymentMethods.map((pm) => (
                    <button
                      key={pm.id}
                      onClick={() => setSelected(pm)}
                      className="w-full flex items-center justify-between gap-3 p-4 rounded-card border border-border hover:border-ink text-left"
                    >
                      <div>
                        <p className="text-[14.5px] font-semibold">{pm.label}</p>
                        <p className="text-[12.5px] text-ink-soft">{methodInfo[pm.type]?.description}</p>
                      </div>
                      <span className="text-ink-soft">→</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-6 p-3 bg-canvas-2 rounded-card">
                <p className="text-[12px] text-ink-soft text-center leading-relaxed">
                  Hatis never handles your payment. You support the creator directly
                  through their own account.
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setSelected(null)}
                className="text-[13px] text-ink-soft hover:text-ink text-left"
              >
                ← All methods
              </button>

              <div className="p-4 rounded-card bg-canvas-2">
                <p className="font-semibold text-[15px]">{selected.label}</p>
                <p className="text-[13px] text-ink-soft">{methodInfo[selected.type]?.description}</p>
              </div>

              <div className="p-4 border border-border rounded-card">
                <p className="text-[11px] font-semibold text-ink-soft uppercase tracking-wide mb-2">
                  {selected.type === "zelle" ? "Email or phone" : "Details"}
                </p>
                <div className="flex items-center justify-between gap-3">
                  <code className="text-[16px] font-semibold break-all">{selected.value}</code>
                  <button
                    onClick={() => handleCopy(selected.value)}
                    className="flex-none px-3.5 py-2 bg-ink text-canvas text-[13px] font-semibold rounded-[10px]"
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {externalLink(selected) ? (
                <a
                  href={externalLink(selected)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-ink text-canvas font-semibold rounded-card text-center"
                >
                  Open link
                </a>
              ) : (
                <div className="p-3 bg-canvas-2 rounded-card">
                  <p className="text-[13px] text-ink-soft leading-relaxed">
                    {methodInfo[selected.type]?.howTo(firstName)}
                  </p>
                </div>
              )}

              {copied && (
                <div className="p-3 bg-teal/10 rounded-card">
                  <p className="text-[13px] text-teal font-medium">
                    Copied. Open your app, send your support, then come back to discover another creator.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
