"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  FaCalendarDays,
  FaClock,
  FaDroplet,
  FaEye,
  FaLocationDot,
  FaUser,
} from "react-icons/fa6";

export default function FeaturedRequests() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedRequests = async () => {
      try {
        setLoading(true);

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

        const response = await fetch(
          `${baseUrl}/api/donationRequests?status=pending&page=1&limit=3&bloodGroup=all&district=&upazila=`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to load featured donation requests."
          );
        }

        setRequests(data?.requests || []);
      } catch (error) {
        console.error("FEATURED_REQUESTS_ERROR:", error);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedRequests();
  }, []);

  const handleViewDetails = (requestId) => {
    if (isPending) return;

    const detailsPath = `/dashboard/donation-requests/${requestId}`;

    if (!user?.email) {
      router.push(`/auth/login?redirect=${encodeURIComponent(detailsPath)}`);
      return;
    }

    router.push(detailsPath);
  };

  if (!loading && requests.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-[1450px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-black text-red-600">
              <FaDroplet />
              Featured Requests
            </p>

            <h2 className="mb-2 text-3xl font-black text-slate-950">
              Featured Blood Requests
            </h2>

            <p className="text-slate-600">
              Recent pending blood donation requests that need your help.
            </p>
          </div>

          <Link
            href="/donation-requests"
            className="inline-flex items-center gap-2 text-sm font-black text-red-600 transition hover:text-red-700"
          >
            View All Requests →
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-slate-100 bg-slate-50 p-6 shadow-sm"
              >
                <div className="animate-pulse space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-slate-200" />
                    <div className="space-y-2">
                      <div className="h-4 w-36 rounded bg-slate-200" />
                      <div className="h-3 w-28 rounded bg-slate-200" />
                    </div>
                  </div>

                  <div className="h-4 w-full rounded bg-slate-200" />
                  <div className="h-10 w-full rounded-xl bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && requests.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((request) => {
              const requestId = request._id || request.id;

              return (
                <motion.div
                  key={requestId}
                  whileHover={{ y: -5 }}
                  className="rounded-3xl border border-slate-100 bg-slate-50 p-6 shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-xl font-black text-red-600">
                        <FaUser />
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                          Recipient
                        </p>

                        <h3 className="text-lg font-black text-slate-950">
                          {request.recipientName || "N/A"}
                        </h3>

                        <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-500">
                          <FaLocationDot className="text-red-500" />
                          {request.recipientDistrict || "N/A"},{" "}
                          {request.recipientUpazila || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex h-12 min-w-12 items-center justify-center rounded-full bg-red-600 px-3 text-sm font-black text-white">
                      {request.bloodGroup || "N/A"}
                    </div>
                  </div>

                  <div className="mb-6 grid grid-cols-2 gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2 rounded-2xl bg-white p-3">
                      <FaCalendarDays className="text-red-500" />
                      <span className="font-bold">
                        {request.donationDate || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 rounded-2xl bg-white p-3">
                      <FaClock className="text-red-500" />
                      <span className="font-bold">
                        {request.donationTime || "N/A"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleViewDetails(requestId)}
                    disabled={isPending}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white py-3 text-sm font-black text-red-600 transition-all hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FaEye />
                    View Details
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}