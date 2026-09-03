export function paystackPublicKey() {
  return (process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "").trim();
}

type PaystackHandler = {
  openIframe: () => void;
};

type PaystackPop = {
  setup: (opts: {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    ref: string;
    metadata?: Record<string, string>;
    callback: (response: { reference: string }) => void;
    onClose: () => void;
  }) => PaystackHandler;
};

declare global {
  interface Window {
    PaystackPop?: PaystackPop;
  }
}

export function loadPaystack(): Promise<PaystackPop> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Paystack is browser-only."));
  }
  if (window.PaystackPop) return Promise.resolve(window.PaystackPop);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://js.paystack.co/v1/inline.js"]',
    );
    const onReady = () => {
      if (window.PaystackPop) resolve(window.PaystackPop);
      else reject(new Error("Paystack failed to load."));
    };
    if (existing) {
      existing.addEventListener("load", onReady, { once: true });
      if (window.PaystackPop) onReady();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = onReady;
    script.onerror = () => reject(new Error("Unable to load Paystack."));
    document.head.appendChild(script);
  });
}

/** Amount in the smallest currency unit (cents for USD). */
export function paystackAmount(usd: number) {
  return Math.round(usd * 100);
}
