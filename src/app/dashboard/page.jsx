"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import {
  FaArrowRight,
  FaCalendarDays,
  FaClock,
  FaDollarSign,
  FaDroplet,
  FaEye,
  FaHandshake,
  FaPenToSquare,
  FaUser,
  FaUsers,
  FaXmark,
} from "react-icons/fa6";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  inprogress: "bg-blue-50 text-blue-700 border-blue-100",
  done: "bg-emerald-50 text-emerald-700 border-emerald-100",
  canceled: "bg-red-50 text-red-700 border-red-100",
};

const roleContent = {
  admin: {
    badge: "Admin Dashboard",
    fallbackName: "Admin",
    description:
      "Monitor platform activity, manage users, review donation requests, and keep LifeDrop operations organized.",
  },
  volunteer: {
    badge: "Volunteer Dashboard",
    fallbackName: "Volunteer",
    description:
      "Review public donation requests, update donation status, and help people find support faster.",
  },
  donor: {
    badge: "Donor Dashboard",
    fallbackName: "Donor",
    description:
      "Manage your blood donation requests, track status updates, and help people find support faster.",
  },
};

const formatDate = (dateValue) => {
  if (!dateValue) return "N/A";

  return new Date(dateValue).toLocaleDateString();
};

export default function DashboardHomePage() {
  const { data: session, isPending } = authClient.useSession();
  const sessionUser = session?.user;

  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState(null);

  const [requests, setRequests] = useState([]);
  const [adminRecentRequests, setAdminRecentRequests] = useState([]);
  const [adminRecentFundings, setAdminRecentFundings] = useState([]);

  const [userLoading, setUserLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

  const role = currentUser?.role || sessionUser?.role || "donor";
  const roleInfo = roleContent[role] || roleContent.donor;

  const userName =
    currentUser?.name || sessionUser?.name || roleInfo.fallbackName;

  const userEmail = currentUser?.email || sessionUser?.email || "";

  useEffect(() => {
    if (isPending) return;

    if (!sessionUser?.email) {
      setCurrentUser(null);
      setUserLoading(false);
      setStatsLoading(false);
      setRequestsLoading(false);
      return;
    }

    const loadCurrentUserAndStats = async () => {
      try {
        setUserLoading(true);
        setStatsLoading(true);

        const meResponse = await fetch(`${baseUrl}/api/auth/me`, {
          method: "GET",
          headers: {
            ...getAuthHeaders(),
          },
          credentials: "include",
          cache: "no-store",
        });

        const meData = await meResponse.json();

        if (!meResponse.ok || !meData?.success) {
          throw new Error(meData?.message || "Failed to load current user.");
        }

        setCurrentUser(meData.user);

        const statsResponse = await fetch(`${baseUrl}/api/dashboard/stats`, {
          method: "GET",
          headers: {
            ...getAuthHeaders(),
          },
          credentials: "include",
          cache: "no-store",
        });

        const statsData = await statsResponse.json();

        if (!statsResponse.ok || !statsData?.success) {
          throw new Error(
            statsData?.message || "Failed to load dashboard statistics."
          );
        }

        setStats(statsData.stats || null);
        setAdminRecentRequests(statsData.recentDonationRequests || []);
        setAdminRecentFundings(statsData.recentFundings || []);
      } catch (error) {
        console.error("DASHBOARD_USER_STATS_ERROR:", error);
        setCurrentUser(sessionUser || null);
        setStats(null);
        setAdminRecentRequests([]);
        setAdminRecentFundings([]);
      } finally {
        setUserLoading(false);
        setStatsLoading(false);
      }
    };

    loadCurrentUserAndStats();
  }, [isPending, sessionUser?.email, baseUrl]);

  useEffect(() => {
    if (isPending || userLoading) return;

    if (role === "admin") {
      setRequests([]);
      setRequestsLoading(false);
      return;
    }

    if (!userEmail) {
      setRequests([]);
      setRequestsLoading(false);
      return;
    }

    const loadRecentRequests = async () => {
      try {
        setRequestsLoading(true);

        const response = await fetch(
          `${baseUrl}/api/donationRequests/my?email=${encodeURIComponent(
            userEmail
          )}&status=all&page=1&limit=3`,
          {
            method: "GET",
            headers: {
              ...getAuthHeaders(),
            },
            cache: "no-store",
            credentials: "include",
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
        setRequestsLoading(false);
      }
    };

    loadRecentRequests();
  }, [isPending, userLoading, userEmail, baseUrl, role]);

  const handleCancelRequest = async (requestId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this donation request?"
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(requestId);

      const response = await fetch(
        `${baseUrl}/api/donationRequests/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          credentials: "include",
          body: JSON.stringify({
            status: "canceled",
            requesterEmail: userEmail,
          }),
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

  const getStatCards = () => {
    if (role === "admin") {
      return [
        {
          title: "Total Donation Requests",
          count: stats?.totalDonationRequests || 0,
          icon: FaDroplet,
        },
        {
          title: "Total Donors",
          count: stats?.totalDonors || 0,
          icon: FaUsers,
        },
        {
          title: "Total Volunteers",
          count: stats?.totalVolunteers || 0,
          icon: FaHandshake,
        },
        {
          title: "Total Funding",
          count: `$${stats?.totalFunding || 0}`,
          icon: FaDollarSign,
        },
      ];
    }

    if (role === "volunteer") {
      return [
        {
          title: "Total Public Requests",
          count: stats?.totalPublicRequests || 0,
          icon: FaDroplet,
        },
        {
          title: "Pending Requests",
          count: stats?.pendingRequests || 0,
          icon: FaClock,
        },
        {
          title: "In Progress Requests",
          count: stats?.inProgressRequests || 0,
          icon: FaHandshake,
        },
        {
          title: "Completed Requests",
          count: stats?.completedRequests || 0,
          icon: FaUsers,
        },
      ];
    }

    return [
      {
        title: "My Total Requests",
        count: stats?.myTotalRequests || 0,
        icon: FaDroplet,
      },
      {
        title: "My Pending Requests",
        count: stats?.myPendingRequests || 0,
        icon: FaClock,
      },
      {
        title: "My In Progress Requests",
        count: stats?.myInProgressRequests || 0,
        icon: FaHandshake,
      },
      {
        title: "My Completed Requests",
        count: stats?.myCompletedRequests || 0,
        icon: FaUsers,
      },
    ];
  };

  const statCards = getStatCards();

  if (isPending || userLoading) {
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
              {roleInfo.badge}
            </p>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Welcome, {userName}!
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-red-50 sm:text-base">
              {roleInfo.description}
            </p>
          </div>
        </div>
      </div>

      {/* Role Based Statistics */}
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <p className="text-sm font-bold uppercase tracking-wide text-red-600">
            Dashboard Overview
          </p>

          <h2 className="mt-1 text-2xl font-black text-slate-950">
            {role === "admin"
              ? "Platform Statistics"
              : role === "volunteer"
                ? "Request Statistics"
                : "My Request Statistics"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {role === "admin"
              ? "Quick overview of LifeDrop platform activity."
              : role === "volunteer"
                ? "Overview of public donation request activity."
                : "Overview of your own donation request activity."}
          </p>
        </div>

        {statsLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-500">
                        {card.title}
                      </p>

                      <h3 className="mt-3 text-3xl font-black text-slate-950">
                        {card.count}
                      </h3>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                      <Icon size={22} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Admin Latest 3 Donation Requests */}
      {role === "admin" && (
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-red-600">
                Latest Requests
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Latest 3 Donation Requests
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Showing the most recent blood donation requests from all users.
              </p>
            </div>

            <Link
              href="/dashboard/all-blood-donation-request"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-700"
            >
              View All Requests
              <FaArrowRight />
            </Link>
          </div>

          {statsLoading ? (
            <div className="p-6">
              <p className="text-sm font-bold text-slate-500">
                Loading latest donation requests...
              </p>
            </div>
          ) : adminRecentRequests.length === 0 ? (
            <div className="p-6">
              <p className="text-sm font-bold text-slate-500">
                No recent donation request found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4">Requester</th>
                    <th className="px-5 py-4">Recipient</th>
                    <th className="px-5 py-4">Location</th>
                    <th className="px-5 py-4">Date & Time</th>
                    <th className="px-5 py-4">Blood</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {adminRecentRequests.map((request) => {
                    const requestId = request._id || request.id;
                    const status =
                      request.donationStatus || request.status || "pending";

                    return (
                      <tr
                        key={requestId}
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-black text-slate-950">
                              {request.requesterName || "N/A"}
                            </p>

                            <p className="text-xs text-slate-500">
                              {request.requesterEmail || "N/A"}
                            </p>
                          </div>
                        </td>

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
                            {status === "inprogress" ? "in progress" : status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/dashboard/donation-requests/${requestId}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-red-600 hover:text-white"
                              title="View"
                            >
                              <FaEye />
                            </Link>

                            {status === "pending" && (
                              <Link
                                href={`/dashboard/edit-donation-request/${requestId}`}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-800 hover:text-white"
                                title="Edit"
                              >
                                <FaPenToSquare />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Admin Latest 3 Funding History */}
      {role === "admin" && (
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-red-600">
                Latest Fundings
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Latest 3 Funding History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Showing the most recent paid funding records from users.
              </p>
            </div>

            <Link
              href="/dashboard/fundings"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-700"
            >
              View All Fundings
              <FaArrowRight />
            </Link>
          </div>

          {statsLoading ? (
            <div className="p-6">
              <p className="text-sm font-bold text-slate-500">
                Loading latest funding records...
              </p>
            </div>
          ) : adminRecentFundings.length === 0 ? (
            <div className="p-6">
              <p className="text-sm font-bold text-slate-500">
                No recent funding record found.
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
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Funding Date</th>
                    <th className="px-5 py-4">Transaction ID</th>
                  </tr>
                </thead>

                <tbody>
                  {adminRecentFundings.map((funding) => (
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
                          {formatDate(funding.createdAt)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-[250px] truncate text-sm font-bold text-slate-600">
                          {funding.transactionId || "N/A"}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Recent Donation Requests - Donor/Volunteer */}
      {role !== "admin" && !requestsLoading && requests.length > 0 && (
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
                          {status === "inprogress" ? "in progress" : status}
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
                            href={`/dashboard/donation-requests/${requestId}`}
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

      {/* Loading recent requests for donor/volunteer */}
      {role !== "admin" && requestsLoading && (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Loading recent donation requests...
          </p>
        </div>
      )}
    </section>
  );
}