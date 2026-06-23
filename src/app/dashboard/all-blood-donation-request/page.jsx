"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FaAngleLeft,
  FaAngleRight,
  FaCalendarDays,
  FaClock,
  FaDroplet,
  FaEllipsisVertical,
  FaEye,
  FaHandshake,
  FaPenToSquare,
  FaUser,
} from "react-icons/fa6";
import { getAuthHeaders } from "@/lib/jwt-token";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  inprogress: "bg-blue-50 text-blue-700 border-blue-100",
  done: "bg-emerald-50 text-emerald-700 border-emerald-100",
  canceled: "bg-red-50 text-red-700 border-red-100",
};

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "inprogress" },
  { label: "Done", value: "done" },
  { label: "Canceled", value: "canceled" },
];

export default function AllBloodDonationRequestPage() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [role, setRole] = useState("");
  const [requestSummary, setRequestSummary] = useState({
    pending: 0,
    inprogress: 0,
  });

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [openMenuId, setOpenMenuId] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
  const limit = 10;

  const loadRequests = async () => {
    try {
      setLoading(true);

      const [mainResponse, pendingResponse, inProgressResponse] =
        await Promise.all([
          fetch(
            `${baseUrl}/api/dashboard/donation-requests?status=${statusFilter}&page=${currentPage}&limit=${limit}`,
            {
              method: "GET",
              headers: {
                ...getAuthHeaders(),
              },
              credentials: "include",
              cache: "no-store",
            }
          ),
          fetch(
            `${baseUrl}/api/dashboard/donation-requests?status=pending&page=1&limit=1`,
            {
              method: "GET",
              headers: {
                ...getAuthHeaders(),
              },
              credentials: "include",
              cache: "no-store",
            }
          ),
          fetch(
            `${baseUrl}/api/dashboard/donation-requests?status=inprogress&page=1&limit=1`,
            {
              method: "GET",
              headers: {
                ...getAuthHeaders(),
              },
              credentials: "include",
              cache: "no-store",
            }
          ),
        ]);

      const mainData = await mainResponse.json();
      const pendingData = await pendingResponse.json();
      const inProgressData = await inProgressResponse.json();

      if (!mainResponse.ok || !mainData?.success) {
        throw new Error(
          mainData?.message || "Failed to load donation requests."
        );
      }

      setRole(mainData.role || "");
      setRequests(mainData.requests || []);
      setPagination(
        mainData.pagination || {
          page: currentPage,
          limit,
          total: 0,
          totalPages: 0,
        }
      );

      setRequestSummary({
        pending: pendingData?.pagination?.total || 0,
        inprogress: inProgressData?.pagination?.total || 0,
      });
    } catch (error) {
      console.error("LOAD_PUBLIC_REQUESTS_ERROR:", error);
      toast.error(error.message || "Failed to load donation requests.");

      setRequests([]);
      setRequestSummary({
        pending: 0,
        inprogress: 0,
      });
      setPagination({
        page: 1,
        limit,
        total: 0,
        totalPages: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    setOpenMenuId("");
  }, [statusFilter, currentPage]);

  const handleFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
    setOpenMenuId("");
  };

  const handleStatusChange = async (request, nextStatus) => {
    const requestId = request._id || request.id;

    const confirmed = window.confirm(
      `Are you sure you want to change this request status to ${nextStatus}?`
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(requestId);

      const response = await fetch(
        `${baseUrl}/api/dashboard/donation-requests/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          credentials: "include",
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to update status.");
      }

      setOpenMenuId("");
      toast.success(data.message || "Status updated successfully.");

      if (requests.length === 1 && currentPage > 1 && statusFilter !== "all") {
        setCurrentPage((prev) => prev - 1);
      } else {
        await loadRequests();
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setActionLoadingId("");
    }
  };

  const filterButtons = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "inprogress" },
    { label: "Done", value: "done" },
    { label: "Canceled", value: "canceled" },
  ];

  const totalPages = pagination.totalPages || 0;
  const totalRequests = pagination.total || 0;

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (pageNumber) => {
      if (totalPages <= 5) return true;

      if (currentPage <= 3) {
        return pageNumber <= 5;
      }

      if (currentPage >= totalPages - 2) {
        return pageNumber >= totalPages - 4;
      }

      return pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2;
    }
  );

  const startItem =
    totalRequests === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;

  const endItem = Math.min(pagination.page * pagination.limit, totalRequests);

  return (
    <section className="space-y-6">
      {/* Page Header */}
<div className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">
  <div className="relative bg-gradient-to-br from-red-600 to-rose-700 p-6 text-white sm:p-8">
    <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
    <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

    <div className="relative z-10 grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-center">
      <div>
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
          <FaDroplet />
          {role === "volunteer" ? "Volunteer Management" : "Admin Management"}
        </p>

        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Public Request
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-red-50 sm:text-base">
          View all blood donation requests, filter by status, and update
          donation progress.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-red-100">
                Pending Requests
              </p>

              <h2 className="mt-2 text-3xl font-black text-white">
                {requestSummary.pending}
              </h2>

              <p className="mt-1 text-xs font-semibold text-red-50">
                Total pending donation requests.
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white">
              <FaClock size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-red-100">
                In Progress
              </p>

              <h2 className="mt-2 text-3xl font-black text-white">
                {requestSummary.inprogress}
              </h2>

              <p className="mt-1 text-xs font-semibold text-red-50">
                Requests currently being processed.
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white">
              <FaHandshake size={22} />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

      {/* Table Card */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-red-600">
              Donation Requests
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-950">
              All Blood Donation Requests
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Showing requests based on selected donation status.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {filterButtons.map((button) => (
              <button
                key={button.value}
                type="button"
                onClick={() => handleFilterChange(button.value)}
                className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-black transition ${statusFilter === button.value
                  ? "bg-red-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600"
                  }`}
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <p className="text-sm font-bold text-slate-500">
              Loading donation requests...
            </p>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-6">
            <p className="text-sm font-bold text-slate-500">
              No donation requests found.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1300px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4">Requester</th>
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
                    const isActionLoading = actionLoadingId === requestId;
                    const isMenuOpen = openMenuId === requestId;

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
                          <div className="relative flex items-center justify-end gap-2">
                            <Link
                              href={`/dashboard/donation-requests/${requestId}`}
                              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-red-600 hover:text-white"
                              title="View"
                            >
                              <FaEye />
                            </Link>

                            {role === "admin" && status === "pending" && (
                              <Link
                                href={`/dashboard/edit-donation-request/${requestId}`}
                                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-800 hover:text-white"
                                title="Edit"
                              >
                                <FaPenToSquare />
                              </Link>
                            )}

                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() =>
                                setOpenMenuId(isMenuOpen ? "" : requestId)
                              }
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                              title="Update status"
                            >
                              <FaEllipsisVertical />
                            </button>

                            {isMenuOpen && (
                              <div className="absolute right-0 top-12 z-30 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                                <div className="mb-1 px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-400">
                                  Update Status
                                </div>

                                {statusOptions.map((option) => (
                                  <button
                                    key={option.value}
                                    type="button"
                                    disabled={
                                      isActionLoading ||
                                      option.value === status
                                    }
                                    onClick={() =>
                                      handleStatusChange(request, option.value)
                                    }
                                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${option.value === status
                                      ? "bg-slate-50 text-slate-400"
                                      : "text-slate-700 hover:bg-red-50 hover:text-red-600"
                                      }`}
                                  >
                                    <FaHandshake />
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-4 border-t border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-bold text-slate-500">
                Showing <span className="text-slate-900">{startItem}</span> to{" "}
                <span className="text-slate-900">{endItem}</span> of{" "}
                <span className="text-slate-900">{totalRequests}</span> requests
              </p>

              {totalPages > 1 && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-100 px-4 text-sm font-black text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaAngleLeft />
                    Prev
                  </button>

                  {pageNumbers.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black transition ${currentPage === pageNumber
                        ? "bg-red-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600"
                        }`}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-100 px-4 text-sm font-black text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <FaAngleRight />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}