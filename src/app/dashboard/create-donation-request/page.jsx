"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    FaCalendarDays,
    FaClock,
    FaDroplet,
    FaEnvelope,
    FaHospital,
    FaLocationDot,
    FaPaperPlane,
    FaRegMessage,
    FaShieldHeart,
    FaUser,
} from "react-icons/fa6";
import { getAuthHeaders } from "@/lib/jwt-token";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const initialForm = {
    requesterName: "",
    requesterEmail: "",
    requesterId: "",

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
};

export default function CreateDonationRequestPage() {
    const router = useRouter();
    const apiBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

    const [form, setForm] = useState(initialForm);

    const [userStatus, setUserStatus] = useState("active");
    const [profileLoading, setProfileLoading] = useState(true);

    const [districts, setDistricts] = useState([]);
    const [upazilas, setUpazilas] = useState([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState([]);

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setProfileLoading(true);

                const [districtRes, upazilaRes, profileRes] = await Promise.all([
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
                const profileData = await profileRes.json();

                if (!profileRes.ok) {
                    throw new Error(profileData?.message || "Failed to load user profile.");
                }

                const districtList = [...(districtJson?.[2]?.data || [])].sort(
                    (a, b) => a.name.localeCompare(b.name)
                );

                const upazilaList = [...(upazilaJson?.[2]?.data || [])].sort((a, b) =>
                    a.name.localeCompare(b.name)
                );

                const user = profileData?.user || {};

                setDistricts(districtList);
                setUpazilas(upazilaList);
                setUserStatus(user?.status || "active");

                setForm((prev) => ({
                    ...prev,
                    requesterId: user?.id || "",
                    requesterName: user?.name || "",
                    requesterEmail: user?.email || "",
                }));
            } catch (error) {
                toast.error(error.message || "Something went wrong.");
            } finally {
                setProfileLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const isBlocked = userStatus === "blocked";

    const today = useMemo(() => {
        const now = new Date();
        return now.toISOString().split("T")[0];
    }, []);

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
        if (!form.requesterName || !form.requesterEmail) {
            toast.error("Requester information not found. Please login again.");
            return false;
        }

        if (isBlocked) {
            toast.error("Blocked users cannot create donation requests.");
            return false;
        }

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

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) return;

        try {
            setSubmitting(true);

            const requestPayload = {
                requesterId: form.requesterId,
                requesterName: form.requesterName,
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

                donationStatus: "pending",
                createdAt: new Date().toISOString(),
            };

            console.log("CREATE_DONATION_REQUEST_PAYLOAD:", requestPayload);

            const response = await fetch(`${apiBaseUrl}/api/donationRequests`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                },
                credentials: "include",
                body: JSON.stringify(requestPayload),
            });

            const data = await response.json();

            if (!response.ok || !data?.success) {
                throw new Error(data?.message || "Failed to create donation request.");
            }

            toast.success("Donation request created successfully.");

            setForm((prev) => ({
                ...initialForm,
                requesterId: prev.requesterId,
                requesterName: prev.requesterName,
                requesterEmail: prev.requesterEmail,
            }));

            setFilteredUpazilas([]);

            router.push("/dashboard/my-donation-requests");
            router.refresh();
        } catch (error) {
            toast.error(error.message || "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass =
        "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-100 disabled:text-slate-500";

    const labelClass = "mb-1.5 block text-sm font-bold text-slate-700";

    if (profileLoading) {
        return (
            <section className="mx-auto max-w-[1050px]">
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 w-56 rounded-xl bg-slate-100" />
                        <div className="h-24 rounded-3xl bg-slate-100" />
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="h-16 rounded-2xl bg-slate-100" />
                            <div className="h-16 rounded-2xl bg-slate-100" />
                            <div className="h-16 rounded-2xl bg-slate-100" />
                            <div className="h-16 rounded-2xl bg-slate-100" />
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-[1050px] space-y-5">
            

            <div className="overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-sm">
                <div className="bg-gradient-to-br from-red-600 to-rose-700 px-5 py-6 text-white">
                    <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-wide backdrop-blur">
                        <FaShieldHeart />
                        Donation Request
                    </p>

                    <h1 className="text-3xl font-black tracking-tight">
                        Create Donation Request
                    </h1>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-red-50">
                        Fill in recipient details, donation location, blood group and preferred
                        time. The request status will be added automatically after submission.
                    </p>
                </div>

                {isBlocked && (
                    <div className="border-b border-red-100 bg-red-50 px-5 py-4">
                        <p className="text-sm font-bold text-red-700">
                            Your account is blocked. You cannot create a donation request.
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-5">
                    <div className="mb-5">
                        <h2 className="text-lg font-black text-slate-950">
                            Requester Information
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            This information comes from your logged-in account and cannot be
                            edited here.
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
                            Provide accurate recipient and donation location details.
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
                                    placeholder="Enter recipient name"
                                    disabled={isBlocked || submitting}
                                    className={`${inputClass} pl-11`}
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
                                    placeholder="Dhaka Medical College Hospital"
                                    disabled={isBlocked || submitting}
                                    className={`${inputClass} pl-11`}
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
                                    disabled={isBlocked || submitting}
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
                                disabled={
                                    isBlocked || submitting || !form.recipientDistrictId
                                }
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
                                    placeholder="Zahir Raihan Rd, Dhaka"
                                    disabled={isBlocked || submitting}
                                    className={`${inputClass} pl-11`}
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
                            Select required blood group, donation date and time.
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
                                        disabled={isBlocked || submitting}
                                        className={`rounded-xl border py-2.5 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${form.bloodGroup === group
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
                                    disabled={isBlocked || submitting}
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
                                    disabled={isBlocked || submitting}
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
                                    placeholder="Write details about why blood is needed..."
                                    rows={4}
                                    disabled={isBlocked || submitting}
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-100 disabled:text-slate-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-500">
                            Donation status will be saved as{" "}
                            <span className="font-black text-red-600">pending</span>.
                        </p>

                        <button
                            type="submit"
                            disabled={isBlocked || submitting}
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <FaPaperPlane />
                            {submitting ? "Creating Request..." : "Request Donation"}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}