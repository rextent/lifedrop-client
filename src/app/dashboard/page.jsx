"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import {
  FaArrowRight,
  FaCalendarDays,
  FaClock,
  FaDroplet,
  FaEye,
  FaPenToSquare,
  FaUser,
  FaXmark,
} from "react-icons/fa6";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  inprogress: "bg-blue-50 text-blue-700 border-blue-100",
  done: "bg-emerald-50 text-emerald-700 border-emerald-100",
  canceled: "bg-red-50 text-red-700 border-red-100",
};

export default function DashboardHomePage() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");

  useEffect(() => {
    if (!user?.email) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const loadRecentRequests = async () => {
      try {
        setLoading(true);

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

        const response = await fetch(
          `${baseUrl}/api/donationRequests/my?email=${encodeURIComponent(
            user.email
          )}&status=all&page=1&limit=3`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load donation requests.");
        }

        setRequests(data?.requests || []);
      } catch (error) {
        console.error("RECENT_REQUESTS_ERROR:", error);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecentRequests();
  }, [user?.email]);

  const handleCancelRequest = async (requestId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this donation request?"
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(requestId);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

      const response = await fetch(
        `${baseUrl}/api/donationRequests/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "canceled" }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Cancel request failed.");
      }

      setRequests((prev) =>
        prev.map((request) =>
          request._id === requestId || request.id === requestId
            ? {
              ...request,
              donationStatus: "canceled",
              status: "canceled",
            }
            : request
        )
      );

      toast.success("Donation request canceled successfully.");
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setActionLoadingId("");
    }
  };

  if (isPending) {
    return (
      <section className="space-y-6">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Loading session...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Welcome Card */}
      <div className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">
        <div className="relative bg-gradient-to-br from-red-600 to-rose-700 p-6 text-white sm:p-8">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
              <FaDroplet />
              Donor Dashboard
            </p>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Welcome, {user?.name || "Donor"}!
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-red-50 sm:text-base">
              Manage your blood donation requests, track status updates, and
              help people find support faster.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Donation Requests - hidden if no request */}
      {!loading && requests.length > 0 && (
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-red-600">
                Recent Requests
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-950">
                My Recent Donation Requests
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Showing maximum 3 recent donation requests created by you.
              </p>
            </div>

            <Link
              href="/dashboard/my-donation-requests"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-700"
            >
              View My All Requests
              <FaArrowRight />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Recipient</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Date & Time</th>
                  <th className="px-5 py-4">Blood</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Donor Info</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => {
                  const requestId = request._id || request.id;
                  const status =
                    request.donationStatus || request.status || "pending";

                  const isInProgress = status === "inprogress";
                  const canCancel =
                    status === "pending" || status === "inprogress";
                  const canEdit = status === "pending";
                  const isActionLoading = actionLoadingId === requestId;

                  return (
                    <tr
                      key={requestId}
                      className="border-b border-slate-100 last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                            <FaUser />
                          </div>

                          <div>
                            <p className="font-black text-slate-950">
                              {request.recipientName || "N/A"}
                            </p>
                            <p className="text-xs text-slate-500">
                              Recipient Name
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800">
                          {request.recipientDistrict || "N/A"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {request.recipientUpazila || "N/A"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
                            <FaCalendarDays className="text-red-500" />
                            {request.donationDate || "N/A"}
                          </p>

                          <p className="flex items-center gap-2 text-sm text-slate-500">
                            <FaClock className="text-red-400" />
                            {request.donationTime || "N/A"}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-xl bg-red-600 px-3 py-1.5 text-sm font-black text-white">
                          {request.bloodGroup || "N/A"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-black capitalize ${statusStyles[status] ||
                            "border-slate-100 bg-slate-50 text-slate-600"
                            }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {isInProgress ? (
                          <div>
                            <p className="text-sm font-black text-slate-900">
                              {request.donorName || "Donor Name"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {request.donorEmail || "donor@email.com"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">
                            Hidden
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/donation-requests/${requestId}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-red-600 hover:text-white"
                            title="View"
                          >
                            <FaEye />
                          </Link>

                          {canEdit && (
                            <Link
                              href={`/dashboard/edit-donation-request/${requestId}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-800 hover:text-white"
                              title="Edit"
                            >
                              <FaPenToSquare />
                            </Link>
                          )}

                          {canCancel && (
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handleCancelRequest(requestId)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                              title="Cancel request"
                            >
                              <FaXmark />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loading recent requests */}
      {loading && (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Loading recent donation requests...
          </p>
        </div>
      )}
    </section>
  );
}