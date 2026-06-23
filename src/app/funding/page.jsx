"use client";

import { getAuthHeaders } from "@/lib/jwt-token";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaCalendarDays,
  FaDollarSign,
  FaHandHoldingHeart,
  FaMoneyBillWave,
  FaUser,
} from "react-icons/fa6";

export default function FundingPage() {
  const [fundings, setFundings] = useState([]);
  const [totalFunding, setTotalFunding] = useState(0);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

  const loadFundings = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${baseUrl}/api/fundings`, {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
        },
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to load fundings.");
      }

      setFundings(data.fundings || []);
      setTotalFunding(data.totalFunding || 0);
    } catch (error) {
      console.error("LOAD_FUNDINGS_ERROR:", error);
      toast.error(error.message || "Failed to load fundings.");
      setFundings([]);
      setTotalFunding(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFundings();
  }, []);

  const handleGiveFund = async () => {
    const fundingAmount = Number(amount);

    if (!fundingAmount || fundingAmount < 1) {
      toast.error("Minimum funding amount is $1.");
      return;
    }

    try {
      setPaymentLoading(true);

      const response = await fetch(`${baseUrl}/api/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          amount: fundingAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to create payment session.");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("CREATE_PAYMENT_ERROR:", error);
      toast.error(error.message || "Payment failed to start.");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      

      <section className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">
          <div className="relative bg-gradient-to-br from-red-600 to-rose-700 p-6 text-white sm:p-8">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
                  <FaHandHoldingHeart />
                  Organization Funding
                </p>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Funding
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-red-50 sm:text-base">
                  Support the organization by giving a small fund. All completed
                  funding records will be shown below.
                </p>
              </div>

              <div className="w-full rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur lg:max-w-md">
                <label className="mb-2 block text-sm font-bold text-white">
                  Fund Amount USD
                </label>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="Example: 10"
                    className="h-12 flex-1 rounded-xl border border-white/20 bg-white px-4 text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    disabled={paymentLoading}
                    onClick={handleGiveFund}
                    className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-red-600 shadow-lg shadow-red-900/10 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FaMoneyBillWave />
                    {paymentLoading ? "Processing..." : "Give Fund"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Funding */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-red-600">
                My Total Funds
              </p>

              <h2 className="mt-2 text-3xl font-black text-slate-950">
                ${totalFunding}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your total successful funding amount.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <FaDollarSign size={24} />
            </div>
          </div>
        </div>

        {/* Funding Table */}
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <p className="text-sm font-bold uppercase tracking-wide text-red-600">
              Funding History
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-950">
              My Funding Records
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Showing your successful funding records.
            </p>
          </div>

          {loading ? (
            <div className="p-6">
              <p className="text-sm font-bold text-slate-500">
                Loading fundings...
              </p>
            </div>
          ) : fundings.length === 0 ? (
            <div className="p-6">
              <p className="text-sm font-bold text-slate-500">
                No funding records found yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Payment Status</th>
                    <th className="px-5 py-4">Funding Date</th>
                  </tr>
                </thead>

                <tbody>
                  {fundings.map((funding) => (
                    <tr
                      key={funding._id}
                      className="border-b border-slate-100 last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                            <FaUser />
                          </div>

                          <div>
                            <p className="font-black text-slate-950">
                              {funding.userName || "N/A"}
                            </p>
                            <p className="text-xs text-slate-500">
                              Funded User
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-slate-700">
                          {funding.userEmail || "N/A"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-xl bg-red-600 px-3 py-1.5 text-sm font-black text-white">
                          ${funding.amount || 0}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-black capitalize text-emerald-700">
                          {funding.paymentStatus || "paid"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
                          <FaCalendarDays className="text-red-500" />
                          {funding.createdAt
                            ? new Date(funding.createdAt).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}