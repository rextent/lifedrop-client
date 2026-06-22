"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  FaArrowLeft,
  FaCalendarDays,
  FaClock,
  FaDroplet,
  FaEnvelope,
  FaFloppyDisk,
  FaHospital,
  FaLocationDot,
  FaRegMessage,
  FaUser,
} from "react-icons/fa6";
import { getAuthHeaders } from "@/lib/jwt-token";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const initialForm = {
  requesterName: "",
  requesterEmail: "",

  recipientName: "",
  recipientDistrictId: "",
  recipientDistrict: "",
  recipientUpazila: "",

  hospitalName: "",
  fullAddressLine: "",

  bloodGroup: "",
  donationDate: "",
  donationTime: "",
  requestMessage: "",
  donationStatus: "",
};

export default function EditDonationRequestPage() {
  const params = useParams();
  const router = useRouter();

  const requestId = params?.id;
  const apiBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

  const [form, setForm] = useState(initialForm);
  const [user, setUser] = useState(null);

  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [filteredUpazilas, setFilteredUpazilas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const today = useMemo(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  }, []);

  const backHref =
    user?.role === "admin" || user?.role === "volunteer"
      ? "/dashboard/all-blood-donation-request"
      : "/dashboard/my-donation-requests";

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        const [districtRes, upazilaRes, meRes] = await Promise.all([
          fetch("/districts.json"),
          fetch("/upazilas.json"),
          fetch(`${apiBaseUrl}/api/auth/me`, {
            method: "GET",
            headers: {
              ...getAuthHeaders(),
            },
            credentials: "include",
            cache: "no-store",
          }),
        ]);

        const districtJson = await districtRes.json();
        const upazilaJson = await upazilaRes.json();
        const meData = await meRes.json();

        if (!meRes.ok || !meData?.success) {
          throw new Error(meData?.message || "Failed to load current user.");
        }

        const currentUser = meData?.user;

        if (!currentUser?.email) {
          throw new Error("User email not found. Please login again.");
        }

        const requestRes = await fetch(
          `${apiBaseUrl}/api/donationRequests/${requestId}?email=${encodeURIComponent(
            currentUser.email
          )}`,
          {
            method: "GET",
            headers: {
              ...getAuthHeaders(),
            },
            credentials: "include",
            cache: "no-store",
          }
        );

        const requestData = await requestRes.json();

        if (!requestRes.ok || !requestData?.success) {
          throw new Error(
            requestData?.message || "Failed to load donation request."
          );
        }

        const districtList = [...(districtJson?.[2]?.data || [])].sort(
          (a, b) => a.name.localeCompare(b.name)
        );

        const upazilaList = [...(upazilaJson?.[2]?.data || [])].sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        const request = requestData?.request || {};

        const matchedDistrict = districtList.find(
          (district) =>
            district.name?.toLowerCase() ===
            request.recipientDistrict?.toLowerCase()
        );

        const districtId = matchedDistrict?.id || "";

        const matchedUpazilas = upazilaList.filter(
          (upazila) => String(upazila.district_id) === String(districtId)
        );

        setUser(currentUser);
        setDistricts(districtList);
        setUpazilas(upazilaList);
        setFilteredUpazilas(matchedUpazilas);

        setForm({
          requesterName: request.requesterName || currentUser.name || "",
          requesterEmail: request.requesterEmail || currentUser.email || "",

          recipientName: request.recipientName || "",
          recipientDistrictId: districtId,
          recipientDistrict: request.recipientDistrict || "",
          recipientUpazila: request.recipientUpazila || "",

          hospitalName: request.hospitalName || "",
          fullAddressLine: request.fullAddressLine || "",

          bloodGroup: request.bloodGroup || "",
          donationDate: request.donationDate || "",
          donationTime: request.donationTime || "",
          requestMessage: request.requestMessage || "",
          donationStatus: request.donationStatus || "pending",
        });
      } catch (error) {
        toast.error(error.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      loadInitialData();
    }
  }, [requestId, apiBaseUrl]);

  const updateField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDistrictChange = (districtId) => {
    const selectedDistrict = districts.find(
      (district) => String(district.id) === String(districtId)
    );

    const matchedUpazilas = upazilas
      .filter((upazila) => String(upazila.district_id) === String(districtId))
      .sort((a, b) => a.name.localeCompare(b.name));

    setFilteredUpazilas(matchedUpazilas);

    setForm((prev) => ({
      ...prev,
      recipientDistrictId: districtId,
      recipientDistrict: selectedDistrict?.name || "",
      recipientUpazila: "",
    }));
  };

  const validateForm = () => {
    if (!form.recipientName.trim()) {
      toast.error("Recipient name is required.");
      return false;
    }

    if (!form.recipientDistrict) {
      toast.error("Recipient district is required.");
      return false;
    }

    if (!form.recipientUpazila) {
      toast.error("Recipient upazila is required.");
      return false;
    }

    if (!form.hospitalName.trim()) {
      toast.error("Hospital name is required.");
      return false;
    }

    if (!form.fullAddressLine.trim()) {
      toast.error("Full address line is required.");
      return false;
    }

    if (!form.bloodGroup) {
      toast.error("Blood group is required.");
      return false;
    }

    if (!form.donationDate) {
      toast.error("Donation date is required.");
      return false;
    }

    if (!form.donationTime) {
      toast.error("Donation time is required.");
      return false;
    }

    if (!form.requestMessage.trim()) {
      toast.error("Request message is required.");
      return false;
    }

    return true;
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setUpdating(true);

      const updatePayload = {
        requesterEmail: form.requesterEmail,

        recipientName: form.recipientName.trim(),
        recipientDistrict: form.recipientDistrict,
        recipientUpazila: form.recipientUpazila,

        hospitalName: form.hospitalName.trim(),
        fullAddressLine: form.fullAddressLine.trim(),

        bloodGroup: form.bloodGroup,
        donationDate: form.donationDate,
        donationTime: form.donationTime,
        requestMessage: form.requestMessage.trim(),
      };

      const response = await fetch(
        `${apiBaseUrl}/api/donationRequests/${requestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          credentials: "include",
          body: JSON.stringify(updatePayload),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to update donation request.");
      }

      toast.success("Donation request updated successfully.");

      router.push(backHref);
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setUpdating(false);
    }
  };

  const inputClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-100 disabled:text-slate-500";

  const labelClass = "mb-1.5 block text-sm font-bold text-slate-700";

  if (loading) {
    return (
      <section className="mx-auto max-w-[1050px]">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Loading donation request...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1050px] space-y-5">
      <Toaster position="top-center" />

      <div className="overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-red-600 to-rose-700 px-5 py-6 text-white">
          <Link
            href={backHref}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-white backdrop-blur transition hover:bg-white/20"
          >
            <FaArrowLeft />
            Back to requests
          </Link>

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-wide backdrop-blur">
            <FaDroplet />
            {user?.role === "admin"
              ? "Admin Edit Access"
              : "My Request Edit"}
          </div>

          <h1 className="text-3xl font-black tracking-tight">
            Edit Donation Request
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-red-50">
            Update recipient details, location, blood group, donation date and
            request message. Request status will not be changed from this form.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="p-5">
          <div className="mb-5">
            <h2 className="text-lg font-black text-slate-950">
              Requester Information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Requester information is read-only.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Requester Name</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.requesterName}
                  readOnly
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Requester Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={form.requesterEmail}
                  readOnly
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>
          </div>

          <div className="my-6 border-t border-slate-100" />

          <div className="mb-5">
            <h2 className="text-lg font-black text-slate-950">
              Recipient & Location
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Update recipient and hospital information.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Recipient Name</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.recipientName}
                  onChange={(event) =>
                    updateField("recipientName", event.target.value)
                  }
                  className={`${inputClass} pl-11`}
                  placeholder="Enter recipient name"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Hospital Name</label>
              <div className="relative">
                <FaHospital className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.hospitalName}
                  onChange={(event) =>
                    updateField("hospitalName", event.target.value)
                  }
                  className={`${inputClass} pl-11`}
                  placeholder="Hospital name"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Recipient District</label>
              <div className="relative">
                <FaLocationDot className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={form.recipientDistrictId}
                  onChange={(event) => handleDistrictChange(event.target.value)}
                  className={`${inputClass} pl-11`}
                >
                  <option value="">Select district</option>

                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Recipient Upazila</label>
              <select
                value={form.recipientUpazila}
                onChange={(event) =>
                  updateField("recipientUpazila", event.target.value)
                }
                disabled={!form.recipientDistrictId}
                className={inputClass}
              >
                <option value="">
                  {form.recipientDistrictId
                    ? "Select upazila"
                    : "Select district first"}
                </option>

                {filteredUpazilas.map((upazila) => (
                  <option key={upazila.id} value={upazila.name}>
                    {upazila.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Full Address Line</label>
              <div className="relative">
                <FaLocationDot className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.fullAddressLine}
                  onChange={(event) =>
                    updateField("fullAddressLine", event.target.value)
                  }
                  className={`${inputClass} pl-11`}
                  placeholder="Full address"
                />
              </div>
            </div>
          </div>

          <div className="my-6 border-t border-slate-100" />

          <div className="mb-5">
            <h2 className="text-lg font-black text-slate-950">
              Donation Details
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Update blood group, date, time and message.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClass}>Blood Group</label>
              <div className="grid grid-cols-4 gap-2">
                {bloodGroups.map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => updateField("bloodGroup", group)}
                    className={`rounded-xl border py-2.5 text-sm font-black transition ${form.bloodGroup === group
                      ? "border-red-600 bg-red-600 text-white shadow-lg shadow-red-100"
                      : "border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Donation Date</label>
              <div className="relative">
                <FaCalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  min={today}
                  value={form.donationDate}
                  onChange={(event) =>
                    updateField("donationDate", event.target.value)
                  }
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Donation Time</label>
              <div className="relative">
                <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="time"
                  value={form.donationTime}
                  onChange={(event) =>
                    updateField("donationTime", event.target.value)
                  }
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Request Message</label>
              <div className="relative">
                <FaRegMessage className="absolute left-4 top-4 text-slate-400" />
                <textarea
                  value={form.requestMessage}
                  onChange={(event) =>
                    updateField("requestMessage", event.target.value)
                  }
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
                  placeholder="Write request message"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Current status:{" "}
              <span className="font-black capitalize text-red-600">
                {form.donationStatus === "inprogress"
                  ? "in progress"
                  : form.donationStatus}
              </span>
            </p>

            <button
              type="submit"
              disabled={updating}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaFloppyDisk />
              {updating ? "Updating Request..." : "Update Donation Request"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}