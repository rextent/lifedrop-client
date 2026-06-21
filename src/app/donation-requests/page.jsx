"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  FaCalendarDays,
  FaClock,
  FaDroplet,
  FaEye,
  FaHospital,
  FaLocationDot,
  FaUser,
} from "react-icons/fa6";

export default function PublicDonationRequestsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPendingRequests = async () => {
      try {
        setLoading(true);

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

        const response = await fetch(
          `${baseUrl}/api/donationRequests?status=pending`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to load donation requests."
          );
        }

        setRequests(data?.requests || []);
      } catch (error) {
        console.error("PUBLIC_DONATION_REQUESTS_ERROR:", error);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    loadPendingRequests();
  }, []);

  const handleViewRequest = (requestId) => {
    if (isPending) return;

    const detailsPath = `/dashboard/donation-requests/${requestId}`;

    if (!user?.email) {
      router.push(`/auth/login?redirect=${encodeURIComponent(detailsPath)}`);
      return;
    }

    router.push(detailsPath);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto w-full max-w-[1450px] px-4 py-10 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">
          <div className="relative bg-gradient-to-br from-red-600 to-rose-700 p-6 text-white sm:p-10">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 max-w-3xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
                <FaDroplet />
                Blood Donation Requests
              </p>

              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                Pending Blood Donation Requests
              </h1>

              <p className="mt-4 text-sm leading-6 text-red-50 sm:text-base">
                Browse all pending blood donation requests and view details to
                help someone in need.
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-bold text-slate-500">
              Loading pending donation requests...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && requests.length === 0 && (
          <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-2xl text-red-600">
              <FaDroplet />
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-950">
              No Pending Requests Found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              There are no pending blood donation requests right now.
            </p>
          </div>
        )}

        {/* Requests Grid */}
        {!loading && requests.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {requests.map((request) => {
              const requestId = request._id || request.id;

              return (
                <div
                  key={requestId}
                  className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-600">
                        <FaUser />
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                          Recipient
                        </p>
                        <h2 className="text-lg font-black text-slate-950">
                          {request.recipientName || "N/A"}
                        </h2>
                      </div>
                    </div>

                    <span className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-black text-white">
                      {request.bloodGroup || "N/A"}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
                      <FaLocationDot className="mt-1 text-red-500" />
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-400">
                          Location
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {request.recipientUpazila || "N/A"},{" "}
                          {request.recipientDistrict || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
                      <FaHospital className="mt-1 text-red-500" />
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-400">
                          Hospital
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {request.hospitalName || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
                        <FaCalendarDays className="mt-1 text-red-500" />
                        <div>
                          <p className="text-xs font-bold uppercase text-slate-400">
                            Date
                          </p>
                          <p className="text-sm font-bold text-slate-800">
                            {request.donationDate || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
                        <FaClock className="mt-1 text-red-500" />
                        <div>
                          <p className="text-xs font-bold uppercase text-slate-400">
                            Time
                          </p>
                          <p className="text-sm font-bold text-slate-800">
                            {request.donationTime || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleViewRequest(requestId)}
                    disabled={isPending}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FaEye />
                    View Details
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}