"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FaCircleCheck, FaArrowRight } from "react-icons/fa6";

export default function FundingSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Verifying your payment...");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setMessage("Session id missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${baseUrl}/api/payment/success`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            sessionId,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "Payment verification failed.");
        }

        setMessage(data.message || "Funding completed successfully.");
        toast.success("Funding completed successfully.");
      } catch (error) {
        setMessage(error.message || "Payment verification failed.");
        toast.error(error.message || "Payment verification failed.");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, baseUrl]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Toaster position="top-center" />

      <div className="w-full max-w-xl rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <FaCircleCheck size={34} />
        </div>

        <h1 className="mt-5 text-3xl font-black text-slate-950">
          Payment Success
        </h1>

        <p className="mt-3 text-sm font-semibold text-slate-500">
          {loading ? "Please wait..." : message}
        </p>

        <Link
          href="/funding"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
        >
          Back to Funding
          <FaArrowRight />
        </Link>
      </div>
    </main>
  );
}