"use client";

import { Toaster } from "react-hot-toast";

export default function GlobalToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={10}
      toastOptions={{
        duration: 2200,
        removeDelay: 300,
        style: {
          borderRadius: "14px",
          fontWeight: "700",
          fontSize: "14px",
          padding: "12px 16px",
        },
        success: {
          duration: 2000,
        },
        error: {
          duration: 2800,
        },
      }}
    />
  );
}