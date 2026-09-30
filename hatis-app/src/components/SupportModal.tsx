import { useEffect, useState } from "react";
import type { PaymentMethod } from "../types/creator";

interface Props {
  creatorName: string;
  paymentMethods: PaymentMethod[];
  onClose: () => void;
}

type PMType = PaymentMethod["type"];

interface ActionResult {
  label: string;
  href?: string;
}

interface TypeMeta {
  blurb: string;
  action: (value: string) => ActionResult;
}

const typeMeta: Record<PMType, TypeMeta> = {
  moncash: {
    blurb: "Send via MonCash",
    action: (v) => ({ label: "Copy " + v }),
  },
  natcash: {
    blurb: "Send via NatCash",
    action: (v) => ({ label: "Copy " + v }),
  },
  paypal: {
    blurb: "Pay online with PayPal",
    action: (v) =>
      v.startsWith("http")
        ? { label: "Open PayPal", href: v }
        : { label: "Copy " + v },
  },
  cashapp: {
    blurb: "Send money with Cash App",
    action: (v) => ({ label: "Open Cash App", href: "https://cash.app/" + v }),
  },
  zelle: {
    blurb: "Send through your bank app",
    action: (v) => ({ label: "Copy " + v }),
  },
  payoneer: {
    blurb: "Pay via Payoneer",
    action: (v) => ({ label: "Copy " + v }),
  },
  bank: {
    blurb: "Send a bank transfer",
    action: () => ({ label: "View details" }),
  },
};

export default function SupportModal({ creatorName, paymentMethods, onClose }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleAction(pm: PaymentMethod) {
    const result = typeMeta[pm.type].action(pm.value);
    if (result.href) {
      window.open(result.href, "_blank", "noopener,noreferrer");
      return;
    }
    if (result.label.indexOf("Copy") === 0) {
      try {
        await navigator.clipboard.writeText(pm.value);
      } catch {
        // Fall through - the value is still shown on screen.
      }
      setCopiedId(pm.id);
      setTimeout(() => setCopiedId((c) => (c === pm.id ? null : c)), 2000);
      return;
    }
    setExpandedId((id) => (id === pm.id ? null : pm.id));
  }

  const firstName = creatorName.split(" ")[0];

  return (
    <div
      className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-canvas rounded-card max-w-[420px] w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-[18px] font-bold flex items-center gap-2">
            <span className="text-red">&hearts;</span> Show love to {firstName}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-ink-soft hover:text-ink text-xl leading-none"
          >
            &times;
          </button>
        </div>
        <p className="text-[13.5px] text-ink-soft mb-5">Choose the way that works best for you.</p>

        <div className="flex flex-col gap-2.5">
          {paymentMethods.map((pm) => {
            const meta = typeMeta[pm.type];
            const isExpanded = expandedId === pm.id;
            const isCopied = copiedId === pm.id;
            return (
              <div key={pm.id}>
                <button
                  onClick={() => handleAction(pm)}
                  className="w-full flex items-center justify-between border border-border rounded-card px-4 py-3.5 hover:border-ink transition-colors text-left"
                >
                  <div>
                    <div className="text-[14.5px] font-semibold">{pm.label}</div>
                    <div className="text-[12.5px] text-ink-soft">
                      {isCopied ? "Copied!" : meta.blurb}
                    </div>
                  </div>
                  <span className="text-ink-soft text-lg">
                    {pm.type === "bank" ? (isExpanded ? "-" : "+") : "->"}
                  </span>
                </button>
                {isExpanded && (
                  <div className="mt-1.5 mb-1 px-4 py-3 bg-canvas-2 rounded-card text-[13px] text-ink-soft whitespace-pre-wrap">
                    {pm.value}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-5 text-[12px] text-ink-soft text-center leading-relaxed">
          Hatis never handles your payment. You support the creator directly through their own
          account.
        </p>
      </div>
    </div>
  );
}
