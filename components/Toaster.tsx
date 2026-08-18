"use client";

import { Toaster as Sonner } from "sonner";

export default function Toaster() {
  return (
    <Sonner
      position="top-center"
      theme="dark"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "border border-[#262626] bg-[#1A1A1A] text-white shadow-lg",
        },
      }}
    />
  );
}
