"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
    FaArrowLeft,
    FaArrowRight,
    FaCalendarDays,
    FaCheck,
    FaClock,
    FaDroplet,
    FaEye,
    FaFilter,
    FaLocationDot,
    FaPenToSquare,
    FaPlus,
    FaTrash,
    FaUser,
    FaXmark,
} from "react-icons/fa6";
import { getAuthHeaders } from "@/lib/jwt-token";

const statusTabs = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "inprogress" },
    { label: "Done", value: "done" },
    { label: "Canceled", value: "canceled" },
];

const statusStyles = {
    pending: "border-amber-100 bg-amber-50 text-amber-700",
    inprogress: "border-blue-100 bg-blue-50 text-blue-700",
    done: "border-emerald-100 bg-emerald-50 text-emerald-700",
    canceled: "border-red-100 bg-red-50 text-red-700",
};

const emptyConfirmModal = {
    open: false,
    type: "",
    requestId: "",
    title: "",
    message: "",
    confirmText: "",
};

export default function MyDonationRequestsPage() {
    const apiBaseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

    const [user, setUser] = useState(null);
    const [requests, setRequests] = useState([]);

    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState("");
    const [confirmModal, setConfirmModal] = useState(emptyConfirmModal);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoadingProfile(true);

                const response = await fetch("/api/users/profile", {
                    cache: "no-store",
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data?.message || "Failed to load user profile.");
                }

                setUser(data?.user || null);
            } catch (error) {
                toast.error(error.message || "Something went wrong.");
            } finally {
                setLoadingProfile(false);
            }
        };

        loadProfile();
    }, []);

    const loadRequests = useCallback(async () => {
        if (!user?.email) return;

        try {
            setLoadingRequests(true);

            const queryParams = new URLSearchParams({
                email: user.email,
                status,
                page: String(page),
                limit: String(limit),
            });

            const response = await fetch(
                `${apiBaseUrl}/api/donationRequests/my?${queryParams.toString()}`,
                {
                    method: "GET",
                    headers: {
                        ...getAuthHeaders(),
                    },
                    credentials: "include",
                    cache: "no-store",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || "Failed to load donation requests.");
            }

            setRequests(data?.requests || []);
            setPagination(
                data?.pagination || {
                    page,
                    limit,
                    total: 0,
                    totalPages: 0,
                }
            );
        } catch (error) {
            toast.error(error.message || "Something went wrong.");
            setRequests([]);
        } finally {
            setLoadingRequests(false);
        }
    }, [apiBaseUrl, user?.email, status, page, limit]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const handleFilterChange = (newStatus) => {
        setStatus(newStatus);
        setPage(1);
    };

    const handleCancelRequest = (requestId) => {
        setConfirmModal({
            open: true,
            type: "cancel",
            requestId,
            title: "Cancel Donation Request?",
            message:
                "This request will not be deleted. Only the status will be changed to canceled.",
            confirmText: "Yes, Cancel Request",
        });
    };

    const handleDeleteRequest = (requestId) => {
        setConfirmModal({
            open: true,
            type: "delete",
            requestId,
            title: "Delete Donation Request?",
            message:
                "This action will permanently delete the donation request. You cannot undo this later.",
            confirmText: "Yes, Delete Request",
        });
    };

    const closeConfirmModal = () => {
        if (actionLoadingId) return;
        setConfirmModal(emptyConfirmModal);
    };

    const handleConfirmAction = async () => {
        if (!confirmModal.requestId || !confirmModal.type || !user?.email) return;

        try {
            setActionLoadingId(confirmModal.requestId);

            if (confirmModal.type === "cancel") {
                const response = await fetch(
                    `${apiBaseUrl}/api/donationRequests/${confirmModal.requestId}/status`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            ...getAuthHeaders(),
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            status: "canceled",
                            requesterEmail: user.email,
                        }),
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data?.message || "Failed to cancel donation request.");
                }

                toast.success("Donation request canceled successfully.");
            }

            if (confirmModal.type === "delete") {
                const response = await fetch(
                    `${apiBaseUrl}/api/donationRequests/${confirmModal.requestId}?email=${encodeURIComponent(
                        user.email
                    )}`,
                    {
                        method: "DELETE",
                        headers: {
                            ...getAuthHeaders(),
                        },
                        credentials: "include",
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data?.message || "Failed to delete donation request.");
                }

                toast.success("Donation request deleted successfully.");
            }

            setConfirmModal(emptyConfirmModal);
            loadRequests();
        } catch (error) {
            toast.error(error.message || "Something went wrong.");
        } finally {
            setActionLoadingId("");
        }
    };

    const handleStatusUpdate = async (requestId, nextStatus) => {
        try {
            setActionLoadingId(requestId);

            const response = await fetch(
                `${apiBaseUrl}/api/donationRequests/${requestId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        ...getAuthHeaders(),
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        status: nextStatus,
                        requesterEmail: user.email,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || "Failed to update status.");
            }

            toast.success(data?.message || "Status updated successfully.");
            loadRequests();
        } catch (error) {
            toast.error(error.message || "Something went wrong.");
        } finally {
            setActionLoadingId("");
        }
    };

    const getStatus = (request) => {
        return request?.donationStatus || request?.status || "pending";
    };

    if (loadingProfile) {
        return (
            <section className="mx-auto max-w-[1280px]">
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                    <p className="text-sm font-bold text-slate-500">
                        Loading donation requests...
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-[1280px] space-y-5">
            <div className="overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-sm">
                <div className="flex flex-col gap-5 bg-gradient-to-br from-red-600 to-rose-700 px-5 py-6 text-white lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-wide backdrop-blur">
                            <FaDroplet />
                            My Donation Requests
                        </p>

                        <h1 className="text-3xl font-black tracking-tight">
                            Donation Requests
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-red-50">
                            View, filter, manage and track all blood donation requests created
                            by your donor account.
                        </p>
                    </div>

                    <Link
                        href="/dashboard/create-donation-request"
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-red-600 transition hover:bg-red-50"
                    >
                        <FaPlus />
                        Create New Request
                    </Link>
                </div>

                <div className="border-b border-slate-100 bg-white p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-700">
                        <FaFilter className="text-red-600" />
                        Filter by status
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {statusTabs.map((tab) => (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => handleFilterChange(tab.value)}
                                className={`cursor-pointer rounded-xl border px-4 py-2 text-sm font-black transition ${
                                    status === tab.value
                                        ? "border-red-600 bg-red-600 text-white shadow-lg shadow-red-100"
                                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loadingRequests ? (
                        <div className="p-6">
                            <p className="text-sm font-bold text-slate-500">
                                Loading requests...
                            </p>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl text-red-600">
                                <FaDroplet />
                            </div>

                            <h3 className="mt-4 text-xl font-black text-slate-950">
                                No donation requests found
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                You have not created any donation request for this filter yet.
                            </p>

                            <Link
                                href="/dashboard/create-donation-request"
                                className="mt-5 inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700"
                            >
                                <FaPlus />
                                Create Donation Request
                            </Link>
                        </div>
                    ) : (
                        <table className="w-full min-w-[1200px] border-collapse text-left">
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
                                    const requestId = request._id;
                                    const currentStatus = getStatus(request);
                                    const isInProgress = currentStatus === "inprogress";
                                    const isActionLoading = actionLoadingId === requestId;

                                    return (
                                        <tr
                                            key={requestId}
                                            className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                                                        <FaUser />
                                                    </div>

                                                    <div>
                                                        <p className="font-black text-slate-950">
                                                            {request.recipientName || "N/A"}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {request.hospitalName || "Hospital not set"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="flex items-center gap-2 font-bold text-slate-800">
                                                    <FaLocationDot className="text-red-500" />
                                                    {request.recipientDistrict || "N/A"}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500">
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
                                                    className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-black capitalize ${
                                                        statusStyles[currentStatus] ||
                                                        "border-slate-100 bg-slate-50 text-slate-600"
                                                    }`}
                                                >
                                                    {currentStatus}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                {isInProgress ? (
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">
                                                            {request.donorName || "N/A"}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {request.donorEmail || "N/A"}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-slate-400">Hidden</span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {isInProgress && (
                                                        <button
                                                            type="button"
                                                            disabled={isActionLoading}
                                                            onClick={() =>
                                                                handleStatusUpdate(requestId, "done")
                                                            }
                                                            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-600 hover:text-white disabled:opacity-60"
                                                            title="Mark as done"
                                                        >
                                                            <FaCheck />
                                                        </button>
                                                    )}

                                                    <Link
                                                        href={`/dashboard/edit-donation-request/${requestId}`}
                                                        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-800 hover:text-white"
                                                        title="Edit"
                                                    >
                                                        <FaPenToSquare />
                                                    </Link>

                                                    {["pending", "inprogress"].includes(currentStatus) && (
                                                        <button
                                                            type="button"
                                                            disabled={isActionLoading}
                                                            onClick={() => handleCancelRequest(requestId)}
                                                            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white disabled:opacity-60"
                                                            title="Cancel request"
                                                        >
                                                            <FaXmark />
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        disabled={isActionLoading}
                                                        onClick={() => handleDeleteRequest(requestId)}
                                                        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white disabled:opacity-60"
                                                        title="Delete request"
                                                    >
                                                        <FaTrash />
                                                    </button>

                                                    <Link
                                                        href={`/dashboard/donation-requests/${requestId}`}
                                                        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-red-600 hover:text-white"
                                                        title="View"
                                                    >
                                                        <FaEye />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {requests.length > 0 && (
                    <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-medium text-slate-500">
                            Showing page{" "}
                            <span className="font-black text-slate-900">
                                {pagination.page}
                            </span>{" "}
                            of{" "}
                            <span className="font-black text-slate-900">
                                {pagination.totalPages || 1}
                            </span>{" "}
                            — Total{" "}
                            <span className="font-black text-slate-900">
                                {pagination.total}
                            </span>{" "}
                            requests
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <FaArrowLeft />
                                Prev
                            </button>

                            <button
                                type="button"
                                disabled={page >= pagination.totalPages}
                                onClick={() =>
                                    setPage((prev) =>
                                        Math.min(prev + 1, pagination.totalPages || 1)
                                    )
                                }
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                                <FaArrowRight />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {confirmModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl text-red-600">
                            {confirmModal.type === "delete" ? <FaTrash /> : <FaXmark />}
                        </div>

                        <div className="mt-5 text-center">
                            <h2 className="text-2xl font-black text-slate-950">
                                {confirmModal.title}
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                {confirmModal.message}
                            </p>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={closeConfirmModal}
                                disabled={!!actionLoadingId}
                                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                No, Keep It
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirmAction}
                                disabled={!!actionLoadingId}
                                className={`inline-flex h-11 flex-1 cursor-pointer items-center justify-center rounded-xl px-4 text-sm font-black text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                    confirmModal.type === "delete"
                                        ? "bg-rose-600 hover:bg-rose-700"
                                        : "bg-red-600 hover:bg-red-700"
                                }`}
                            >
                                {actionLoadingId ? "Processing..." : confirmModal.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}