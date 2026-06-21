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
  FaMagnifyingGlass,
  FaRotateRight,
  FaUser,
} from "react-icons/fa6";

const bloodGroups = ["all", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function PublicDonationRequestsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [bloodGroup, setBloodGroup] = useState("all");
  const [district, setDistrict] = useState("");
  const [upazila, setUpazila] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    bloodGroup: "all",
    district: "",
    upazila: "",
  });

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    const loadPendingRequests = async () => {
      try {
        setLoading(true);

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

        const queryParams = new URLSearchParams({
          status: "pending",
          page: String(page),
          limit: "6",
          bloodGroup: appliedFilters.bloodGroup,
          district: appliedFilters.district,
          upazila: appliedFilters.upazila,
        });

        const response = await fetch(
          `${baseUrl}/api/donationRequests?${queryParams.toString()}`,
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
        setPagination(
          data?.pagination || {
            page: 1,
            limit: 6,
            total: 0,
            totalPages: 0,
          }
        );
      } catch (error) {
        console.error("PUBLIC_DONATION_REQUESTS_ERROR:", error);
        setRequests([]);
        setPagination({
          page: 1,
          limit: 6,
          total: 0,
          totalPages: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadPendingRequests();
  }, [page, appliedFilters]);

  const handleApplyFilter = (event) => {
    event.preventDefault();

    setPage(1);
    setAppliedFilters({
      bloodGroup,
      district: district.trim(),
      upazila: upazila.trim(),
    });
  };

  const handleResetFilter = () => {
    setBloodGroup("all");
    setDistrict("");
    setUpazila("");
    setPage(1);
    setAppliedFilters({
      bloodGroup: "all",
      district: "",
      upazila: "",
    });
  };

  const handleViewRequest = (requestId) => {
    if (isPending) return;

    const detailsPath = `/dashboard/donation-requests/${requestId}`;

    if (!user?.email) {
      router.push(`/auth/login?redirect=${encodeURIComponent(detailsPath)}`);
      return;
    }

    router.push(detailsPath);
  };

  const currentPage = pagination.page || page;
  const totalPages = pagination.totalPages || 0;

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

        {/* Filter Box */}
        <form
          onSubmit={handleApplyFilter}
          className="mb-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-red-600">
                Filter Requests
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Find Matching Blood Requests
              </h2>
            </div>

            <p className="text-sm font-bold text-slate-500">
              Total Found: {pagination.total || 0}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                Blood Group
              </label>

              <select
                value={bloodGroup}
                onChange={(event) => setBloodGroup(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-50"
              >
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group === "all" ? "All Blood Groups" : group}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                District
              </label>

              <input
                type="text"
                value={district}
                onChange={(event) => setDistrict(event.target.value)}
                placeholder="Example: Dhaka"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                Upazila
              </label>

              <input
                type="text"
                value={upazila}
                onChange={(event) => setUpazila(event.target.value)}
                placeholder="Example: Mirpur"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-50"
              />
            </div>

            <div className="flex gap-3 md:items-end">
              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
              >
                <FaMagnifyingGlass />
                Filter
              </button>

              <button
                type="button"
                onClick={handleResetFilter}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200"
                title="Reset Filter"
              >
                <FaRotateRight />
              </button>
            </div>
          </div>
        </form>

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
              No pending donation request matched your filter.
            </p>
          </div>
        )}

        {/* Requests Grid */}
        {!loading && requests.length > 0 && (
          <>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:flex-row">
                <p className="text-sm font-bold text-slate-500">
                  Page {currentPage} of {totalPages}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage <= 1 || loading}
                    className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1)
                    .slice(
                      Math.max(currentPage - 3, 0),
                      Math.min(currentPage + 2, totalPages)
                    )
                    .map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => setPage(pageNumber)}
                        disabled={loading}
                        className={`h-10 w-10 rounded-2xl text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          currentPage === pageNumber
                            ? "bg-red-600 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}

                  <button
                    type="button"
                    onClick={() =>
                      setPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage >= totalPages || loading}
                    className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}