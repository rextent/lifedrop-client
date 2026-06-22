"use client";

import { Toaster } from "react-hot-toast";

export default function GlobalToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: "14px",
          fontWeight: "700",
        },
      }}
    />
  );
}