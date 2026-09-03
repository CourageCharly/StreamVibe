const TEST_PUBLIC_KEY =
  "pk_test_439d03450468cf1c707b0eb9df2df27cd18ba691";

export function paystackPublicKey() {
  return (
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim() || TEST_PUBLIC_KEY
  );
}

export function paystackCurrency() {
  const value = (process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY ?? "NGN")
    .trim()
    .toUpperCase();
  return value || "NGN";
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

/** Amount in the smallest currency unit (kobo for NGN, cents for USD). */
export function paystackAmount(usd: number, currency = paystackCurrency()) {
  if (currency === "NGN") {
    // UI prices are USD; charge the same figures in naira for test (9.99 → ₦999).
    return Math.round(usd * 100 * 100);
  }
  return Math.round(usd * 100);
}
