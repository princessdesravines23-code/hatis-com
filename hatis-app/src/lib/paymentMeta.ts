import { Smartphone, Wallet, Building2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PaymentMethod } from "../types/creator";

export interface PaymentMeta {
  icon: LucideIcon;
  bgColor: string;
  color: string;
  description: string;
  link: (value: string) => string | null;
  instructions: (firstName: string) => string;
}

const paymentMeta: Record<PaymentMethod["type"], PaymentMeta> = {
  moncash: {
    icon: Smartphone,
    bgColor: "bg-orange-50",
    color: "text-orange-600",
    description: "Haiti mobile money",
    link: () => null,
    instructions: (n) =>
      `Open your MonCash app, enter the number above, and send your support to ${n}.`,
  },
  natcash: {
    icon: Smartphone,
    bgColor: "bg-teal-50",
    color: "text-teal-600",
    description: "Haiti mobile money",
    link: () => null,
    instructions: (n) =>
      `Open your NatCash app, enter the number above, and send your support to ${n}.`,
  },
  paypal: {
    icon: Wallet,
    bgColor: "bg-blue-50",
    color: "text-blue-600",
    description: "Pay online with PayPal",
    link: (v) => (v.startsWith("http") ? v : null),
    instructions: () =>
      "Use the PayPal email above, or open the link to pay online.",
  },
  zelle: {
    icon: Wallet,
    bgColor: "bg-purple-50",
    color: "text-purple-600",
    description: "Send through your bank app",
    link: () => null,
    instructions: () =>
      "Zelle is sent through your bank's mobile app. Open your banking app, find Zelle, and send to the email or phone above.",
  },
  payoneer: {
    icon: Wallet,
    bgColor: "bg-red-50",
    color: "text-red-600",
    description: "Pay via Payoneer",
    link: () => null,
    instructions: () => "Use the email above to send a payment through Payoneer.",
  },
  cashapp: {
    icon: Wallet,
    bgColor: "bg-green-50",
    color: "text-green-600",
    description: "Send money with Cash App",
    link: (v) => `https://cash.app/${v}`,
    instructions: () => "Open Cash App and send to the $cashtag above.",
  },
  bank: {
    icon: Building2,
    bgColor: "bg-slate-50",
    color: "text-slate-600",
    description: "Bank transfer",
    link: () => null,
    instructions: () => "Use the account details above to send a bank transfer.",
  },
};

export default paymentMeta;