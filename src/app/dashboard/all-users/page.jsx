"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaAngleLeft,
  FaAngleRight,
  FaBan,
  FaEllipsisVertical,
  FaHandshake,
  FaUnlock,
  FaUser,
  FaUsers,
  FaUserShield,
} from "react-icons/fa6";

const roleStyles = {
  admin: "bg-purple-50 text-purple-700 border-purple-100",
  volunteer: "bg-blue-50 text-blue-700 border-blue-100",
  donor: "bg-red-50 text-red-700 border-red-100",
};

const statusStyles = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-100",
  blocked: "bg-red-50 text-red-700 border-red-100",
};

export default function AllUsersPage() {
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
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

  const loadUsers = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${baseUrl}/api/admin/users?status=${statusFilter}&page=${currentPage}&limit=${limit}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to load users.");
      }

      setUsers(data.users || []);
      setPagination(
        data.pagination || {
          page: currentPage,
          limit,
          total: 0,
          totalPages: 0,
        }
      );
    } catch (error) {
      console.error("LOAD_ALL_USERS_ERROR:", error);
      toast.error(error.message || "Failed to load users.");
      setUsers([]);
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
    loadUsers();
    setOpenMenuId("");
  }, [statusFilter, currentPage]);

  const handleFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
    setOpenMenuId("");
  };

  const handleStatusChange = async (user, nextStatus) => {
    const actionText = nextStatus === "blocked" ? "block" : "unblock";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} this user?`
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(user._id);

      const response = await fetch(
        `${baseUrl}/api/admin/users/${user._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to update user status.");
      }

      setOpenMenuId("");
      toast.success(data.message || "User status updated successfully.");

      if (users.length === 1 && currentPage > 1 && statusFilter !== "all") {
        setCurrentPage((prev) => prev - 1);
      } else {
        await loadUsers();
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleRoleChange = async (user, nextRole) => {
    const confirmed = window.confirm(
      `Are you sure you want to make this user ${nextRole}?`
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(user._id);

      const response = await fetch(
        `${baseUrl}/api/admin/users/${user._id}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            role: nextRole,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to update user role.");
      }

      setOpenMenuId("");
      toast.success(data.message || "User role updated successfully.");
      await loadUsers();
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setActionLoadingId("");
    }
  };

  const filterButtons = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Blocked", value: "blocked" },
  ];

  const totalPages = pagination.totalPages || 0;
  const totalUsers = pagination.total || 0;

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((pageNumber) => {
      if (totalPages <= 5) return true;

      if (currentPage <= 3) {
        return pageNumber <= 5;
      }

      if (currentPage >= totalPages - 2) {
        return pageNumber >= totalPages - 4;
      }

      return (
        pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2
      );
    });

  const startItem =
    totalUsers === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;

  const endItem = Math.min(pagination.page * pagination.limit, totalUsers);

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">
        <div className="relative bg-gradient-to-br from-red-600 to-rose-700 p-6 text-white sm:p-8">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
              <FaUsers />
              Admin Management
            </p>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              All Users
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-red-50 sm:text-base">
              View users, filter by status, block or unblock accounts, and
              manage user roles.
            </p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-red-600">
              User List
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-950">
              Manage All Users
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Showing users based on selected account status.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {filterButtons.map((button) => (
              <button
                key={button.value}
                type="button"
                onClick={() => handleFilterChange(button.value)}
                className={`rounded-xl px-4 py-2 text-sm font-black transition ${
                  statusFilter === button.value
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
              Loading users...
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-6">
            <p className="text-sm font-bold text-slate-500">
              No users found.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => {
                    const userStatus = user.status || "active";
                    const userRole = user.role || "donor";
                    const userImage =
                      user.image ||
                      user.avatar ||
                      user.avatarUrl ||
                      "/default-avatar.png";

                    const isActionLoading = actionLoadingId === user._id;
                    const isMenuOpen = openMenuId === user._id;

                    return (
                      <tr
                        key={user._id}
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={userImage}
                              alt={user.name || "User"}
                              className="h-11 w-11 rounded-2xl object-cover"
                            />

                            <div>
                              <p className="font-black text-slate-950">
                                {user.name || "N/A"}
                              </p>

                              <p className="text-xs text-slate-500">
                                User Name
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-slate-700">
                            {user.email || "N/A"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-black capitalize ${
                              roleStyles[userRole] ||
                              "border-slate-100 bg-slate-50 text-slate-600"
                            }`}
                          >
                            {userRole}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-black capitalize ${
                              statusStyles[userStatus] ||
                              "border-slate-100 bg-slate-50 text-slate-600"
                            }`}
                          >
                            {userStatus}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="relative flex justify-end">
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() =>
                                setOpenMenuId(isMenuOpen ? "" : user._id)
                              }
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                              title="Manage user"
                            >
                              <FaEllipsisVertical />
                            </button>

                            {isMenuOpen && (
                              <div className="absolute right-0 top-12 z-30 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                                {userStatus === "active" ? (
                                  <button
                                    type="button"
                                    disabled={isActionLoading}
                                    onClick={() =>
                                      handleStatusChange(user, "blocked")
                                    }
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    <FaBan />
                                    Block User
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={isActionLoading}
                                    onClick={() =>
                                      handleStatusChange(user, "active")
                                    }
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    <FaUnlock />
                                    Unblock User
                                  </button>
                                )}

                                {userRole === "donor" && (
                                  <button
                                    type="button"
                                    disabled={isActionLoading}
                                    onClick={() =>
                                      handleRoleChange(user, "volunteer")
                                    }
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    <FaHandshake />
                                    Make Volunteer
                                  </button>
                                )}

                                {userRole !== "admin" && (
                                  <button
                                    type="button"
                                    disabled={isActionLoading}
                                    onClick={() =>
                                      handleRoleChange(user, "admin")
                                    }
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-purple-600 transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    <FaUserShield />
                                    Make Admin
                                  </button>
                                )}

                                {userRole === "admin" && (
                                  <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-400">
                                    <FaUser />
                                    Already Admin
                                  </div>
                                )}
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
                Showing{" "}
                <span className="text-slate-900">{startItem}</span> to{" "}
                <span className="text-slate-900">{endItem}</span> of{" "}
                <span className="text-slate-900">{totalUsers}</span> users
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
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black transition ${
                        currentPage === pageNumber
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