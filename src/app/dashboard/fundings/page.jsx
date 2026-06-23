"use client";

import { getAuthHeaders } from "@/lib/jwt-token";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaAngleLeft,
  FaAngleRight,
  FaCalendarDays,
  FaDollarSign,
  FaMagnifyingGlass,
  FaMoneyBillWave,
  FaRotateRight,
  FaUser,
} from "react-icons/fa6";

const statusButtons = [
  { label: "All", value: "all" },
  { label: "Paid", value: "paid" },
  { label: "Unpaid", value: "unpaid" },
];

export default function AdminFundingsPage() {
  const [fundings, setFundings] = useState([]);
  const [summary, setSummary] = useState({
    totalFunding: 0,
    filteredFunding: 0,
  });

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
  const limit = 10;

  const loadFundings = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(limit),
        status: statusFilter,
        search,
        startDate,
        endDate,
      });

      const response = await fetch(`${baseUrl}/api/admin/fundings?${params}`, {
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
      setSummary(
        data.summary || {
          totalFunding: 0,
          filteredFunding: 0,
        }
      );

      setPagination(
        data.pagination || {
          page: currentPage,
          limit,
          total: 0,
          totalPages: 0,
        }
      );
    } catch (error) {
      console.error("LOAD_ADMIN_FUNDINGS_ERROR:", error);
      toast.error(error.message || "Failed to load fundings.");

      setFundings([]);
      setSummary({
        totalFunding: 0,
        filteredFunding: 0,
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
    loadFundings();
  }, [currentPage, statusFilter, search, startDate, endDate]);

  const handleSearch = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    setSearch(searchInput.trim());
  };

  const handleStatusChange = (value) => {
    setCurrentPage(1);
    setStatusFilter(value);
  };

  const handleDateChange = (type, value) => {
    setCurrentPage(1);

    if (type === "start") {
      setStartDate(value);
      return;
    }

    setEndDate(value);
  };

  const handleReset = () => {
    setSearch("");
    setSearchInput("");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const totalPages = pagination.totalPages || 0;
  const totalRecords = pagination.total || 0;

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  ).filter((pageNumber) => {
    if (totalPages <= 5) return true;

    if (currentPage <= 3) {
      return pageNumber <= 5;
    }

    if (currentPage >= totalPages - 2) {
      return pageNumber >= totalPages - 4;
    }

    return pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2;
  });

  const startItem =
    totalRecords === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;

  const endItem = Math.min(pagination.page * pagination.limit, totalRecords);

  return (
    <section className="space-y-6">


      {/* Header With Summary */}
      <div className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">
        <div className="relative bg-gradient-to-br from-red-600 to-rose-700 p-6 text-white sm:p-8">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10 grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-center">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
                <FaMoneyBillWave />
                Admin Funding Management
              </p>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Funding Records
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-red-50 sm:text-base">
                Track all organization funding records, filter transactions and
                monitor total funding amount.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-red-100">
                      Total Funding
                    </p>

                    <h2 className="mt-2 text-3xl font-black text-white">
                      ${summary.totalFunding}
                    </h2>

                    <p className="mt-1 text-xs font-semibold text-red-50">
                      Total paid funding from all users.
                    </p>
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white">
                    <FaDollarSign size={22} />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-red-100">
                      Filtered Total
                    </p>

                    <h2 className="mt-2 text-3xl font-black text-white">
                      ${summary.filteredFunding}
                    </h2>

                    <p className="mt-1 text-xs font-semibold text-red-50">
                      Total funding based on current filters.
                    </p>
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white">
                    <FaMoneyBillWave size={22} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table + Filters */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-red-600">
                Funding History
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-950">
                All Funding Records
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Showing funding records based on current filter.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {statusButtons.map((button) => (
                <button
                  key={button.value}
                  type="button"
                  onClick={() => handleStatusChange(button.value)}
                  className={`rounded-xl px-4 py-2 text-sm font-black transition ${statusFilter === button.value
                    ? "bg-red-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600"
                    }`}
                >
                  {button.label}
                </button>
              ))}
            </div>
          </div>

          {/* Compact Filter Bar */}
          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <form
              onSubmit={handleSearch}
              className="grid gap-3 xl:grid-cols-[1.4fr_0.7fr_0.7fr_auto_auto] xl:items-end"
            >
              <div>
                <label className="mb-1.5 block text-sm font-black text-slate-700">
                  Search
                </label>

                <div className="relative">
                  <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search name, email or transaction id"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pl-11 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-black text-slate-700">
                  Start Date
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(event) =>
                    handleDateChange("start", event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-black text-slate-700">
                  End Date
                </label>

                <input
                  type="date"
                  value={endDate}
                  onChange={(event) =>
                    handleDateChange("end", event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
                />
              </div>

              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700"
              >
                <FaMagnifyingGlass />
                Search
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-slate-600 ring-1 ring-slate-200 transition hover:bg-red-50 hover:text-red-600"
              >
                <FaRotateRight />
                Reset
              </button>
            </form>
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <p className="text-sm font-bold text-slate-500">
              Loading funding records...
            </p>
          </div>
        ) : fundings.length === 0 ? (
          <div className="p-6">
            <p className="text-sm font-bold text-slate-500">
              No funding records found.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Transaction ID</th>
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
                        <p className="max-w-[260px] truncate text-sm font-bold text-slate-600">
                          {funding.transactionId || "N/A"}
                        </p>
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

            {/* Pagination */}
            <div className="flex flex-col gap-4 border-t border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-bold text-slate-500">
                Showing <span className="text-slate-900">{startItem}</span> to{" "}
                <span className="text-slate-900">{endItem}</span> of{" "}
                <span className="text-slate-900">{totalRecords}</span> records
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