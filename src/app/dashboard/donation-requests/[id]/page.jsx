"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaCalendarDays,
  FaClock,
  FaDroplet,
  FaEnvelope,
  FaHospital,
  FaLocationDot,
  FaMessage,
  FaUser,
  FaXmark,
} from "react-icons/fa6";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  inprogress: "bg-blue-50 text-blue-700 border-blue-100",
  done: "bg-emerald-50 text-emerald-700 border-emerald-100",
  canceled: "bg-red-50 text-red-700 border-red-100",
};

export default function DonationRequestDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const requestId = params?.id;

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    if (isPending) return;

    if (!user?.email) {
      router.push(
        `/auth/login?redirect=${encodeURIComponent(
          `/donation-requests/${requestId}`
        )}`
      );
      return;
    }

    const loadRequestDetails = async () => {
      try {
        setLoading(true);

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

        const response = await fetch(
          `${baseUrl}/api/donationRequests/details/${requestId}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to load donation request details."
          );
        }

        setRequest(data?.request || null);
      } catch (error) {
        console.error("DONATION_DETAILS_ERROR:", error);
        toast.error(error.message || "Something went wrong.");
        setRequest(null);
      } finally {
        setLoading(false);
      }
    };

    loadRequestDetails();
  }, [isPending, user?.email, requestId, router]);

  const handleConfirmDonation = async () => {
    if (!user?.name || !user?.email) {
      toast.error("User session not found.");
      return;
    }

    try {
      setConfirmLoading(true);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

      const response = await fetch(
        `${baseUrl}/api/donationRequests/${requestId}/donate`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            donorName: user.name,
            donorEmail: user.email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to confirm donation.");
      }

      setRequest(data?.request || null);
      setDonateModalOpen(false);
      toast.success("Donation confirmed successfully.");
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setConfirmLoading(false);
    }
  };

  if (isPending || loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto w-full max-w-[1450px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
            <p className="text-sm font-bold text-slate-500">
              Loading donation request details...
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (!request) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto w-full max-w-[1450px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-2xl text-red-600">
              <FaDroplet />
            </div>

            <h1 className="mt-5 text-2xl font-black text-slate-950">
              Donation Request Not Found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              The donation request may have been removed or unavailable.
            </p>

            <button
              type="button"
              onClick={() => router.push("/donation-requests")}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
            >
              <FaArrowLeft />
              Back to Requests
            </button>
          </div>
        </section>
      </main>
    );
  }

  const status = request.donationStatus || "pending";
  const canDonate = status === "pending";

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto w-full max-w-[1450px] px-4 py-10 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.push("/donation-requests")}
          className="mb-5 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-100 transition hover:bg-slate-100"
        >
          <FaArrowLeft />
          Back to Requests
        </button>

        {/* Header */}
        <div className="mb-6 overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">
          <div className="relative bg-gradient-to-br from-red-600 to-rose-700 p-6 text-white sm:p-10">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
                  <FaDroplet />
                  Blood Donation Request Details
                </p>

                <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                  {request.recipientName || "Recipient"}
                </h1>

                <p className="mt-4 max-w-3xl text-sm leading-6 text-red-50 sm:text-base">
                  Full information about this blood donation request.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-2xl bg-white px-5 py-3 text-lg font-black text-red-600">
                  {request.bloodGroup || "N/A"}
                </span>

                <span
                  className={`inline-flex rounded-full border px-4 py-2 text-sm font-black capitalize ${
                    statusStyles[status] ||
                    "border-slate-100 bg-slate-50 text-slate-600"
                  }`}
                >
                  {status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-2xl font-black text-slate-950">
                Request Information
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <InfoCard
                  icon={<FaUser />}
                  label="Requester Name"
                  value={request.requesterName}
                />

                <InfoCard
                  icon={<FaEnvelope />}
                  label="Requester Email"
                  value={request.requesterEmail}
                />

                <InfoCard
                  icon={<FaUser />}
                  label="Recipient Name"
                  value={request.recipientName}
                />

                <InfoCard
                  icon={<FaDroplet />}
                  label="Blood Group"
                  value={request.bloodGroup}
                />

                <InfoCard
                  icon={<FaLocationDot />}
                  label="Recipient District"
                  value={request.recipientDistrict}
                />

                <InfoCard
                  icon={<FaLocationDot />}
                  label="Recipient Upazila"
                  value={request.recipientUpazila}
                />

                <InfoCard
                  icon={<FaHospital />}
                  label="Hospital Name"
                  value={request.hospitalName}
                />

                <InfoCard
                  icon={<FaLocationDot />}
                  label="Full Address"
                  value={request.fullAddressLine}
                />

                <InfoCard
                  icon={<FaCalendarDays />}
                  label="Donation Date"
                  value={request.donationDate}
                />

                <InfoCard
                  icon={<FaClock />}
                  label="Donation Time"
                  value={request.donationTime}
                />
              </div>

              <div className="mt-4 rounded-3xl bg-slate-50 p-5">
                <div className="flex items-center gap-3 text-red-600">
                  <FaMessage />
                  <p className="text-sm font-black uppercase tracking-wide">
                    Request Message
                  </p>
                </div>

                <p className="mt-3 text-sm leading-7 text-slate-700">
                  {request.requestMessage || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Donate Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-red-50 text-2xl text-red-600">
                <FaDroplet />
              </div>

              <h2 className="mt-5 text-2xl font-black text-slate-950">
                Ready to Donate?
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Confirm your donation to help this recipient. After confirmation,
                the request status will change from pending to inprogress.
              </p>

              {request.donorName && request.donorEmail && (
                <div className="mt-5 rounded-2xl bg-blue-50 p-4">
                  <p className="text-xs font-black uppercase text-blue-600">
                    Donor Information
                  </p>
                  <p className="mt-2 text-sm font-black text-slate-900">
                    {request.donorName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {request.donorEmail}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setDonateModalOpen(true)}
                disabled={!canDonate}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <FaDroplet />
                {canDonate ? "Donate Now" : "Donation Not Available"}
              </button>

              {!canDonate && (
                <p className="mt-3 text-center text-xs font-bold text-slate-400">
                  This request is already {status}.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Donate Modal */}
      {donateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-red-600">
                  Confirm Donation
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  Donate Blood
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Please confirm your donor information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDonateModalOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-red-600 hover:text-white"
              >
                <FaXmark />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Donor Name
                </label>
                <input
                  type="text"
                  value={user?.name || ""}
                  readOnly
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Donor Email
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none"
                />
              </div>

              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-sm font-bold leading-6 text-red-700">
                  After confirmation, this request status will be changed from
                  pending to inprogress.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDonateModalOpen(false)}
                disabled={confirmLoading}
                className="inline-flex justify-center rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDonation}
                disabled={confirmLoading}
                className="inline-flex justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {confirmLoading ? "Confirming..." : "Confirm Donation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-4">
      <div className="flex items-center gap-3 text-red-600">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white">
          {icon}
        </span>

        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
          {label}
        </p>
      </div>

      <p className="mt-3 break-words text-sm font-black text-slate-900">
        {value || "N/A"}
      </p>
    </div>
  );
}