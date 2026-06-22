"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import toast, { Toaster } from "react-hot-toast";
import {
    FaArrowRight,
    FaCamera,
    FaDroplet,
    FaEnvelope,
    FaEye,
    FaEyeSlash,
    FaLocationDot,
    FaLock,
    FaUser,
    FaUserPlus,
} from "react-icons/fa6";
import { createJwtToken } from "@/lib/jwt-token";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const initialForm = {
    name: "",
    email: "",
    bloodGroup: "",
    districtId: "",
    district: "",
    upazila: "",
    password: "",
    confirmPassword: "",
};

export default function SignupPage() {
    const router = useRouter();

    const [form, setForm] = useState(initialForm);
    const [districts, setDistricts] = useState([]);
    const [upazilas, setUpazilas] = useState([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState([]);

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");

    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        const loadLocationData = async () => {
            try {
                const districtRes = await fetch("/districts.json");
                const districtJson = await districtRes.json();

                const upazilaRes = await fetch("/upazilas.json");
                const upazilaJson = await upazilaRes.json();

                const districtList = districtJson?.[2]?.data || [];
                const upazilaList = upazilaJson?.[2]?.data || [];

                const sortedDistricts = [...districtList].sort((a, b) =>
                    a.name.localeCompare(b.name)
                );

                const sortedUpazilas = [...upazilaList].sort((a, b) =>
                    a.name.localeCompare(b.name)
                );

                setDistricts(sortedDistricts);
                setUpazilas(sortedUpazilas);
            } catch {
                toast.error("District and upazila data load failed.");
            }
        };

        loadLocationData();
    }, []);

    const passwordLabel = useMemo(() => {
        if (!form.password) return "Minimum 8 characters";
        if (form.password.length < 8) return "Password is too short";
        if (form.password.length >= 8 && form.password.length < 12) {
            return "Good password";
        }

        return "Strong password";
    }, [form.password]);

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
            districtId,
            district: selectedDistrict?.name || "",
            upazila: "",
        }));
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.type)) {
            toast.error("Only JPG, PNG, or WEBP image is allowed.");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Avatar must be less than 2MB.");
            return;
        }

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const uploadAvatar = async () => {
        const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

        if (!apiKey) {
            throw new Error("NEXT_PUBLIC_IMGBB_API_KEY is missing.");
        }

        const imageData = new FormData();
        imageData.append("image", avatarFile);

        const response = await fetch(
            `https://api.imgbb.com/1/upload?key=${apiKey}`,
            {
                method: "POST",
                body: imageData,
            }
        );

        const data = await response.json();

        if (!response.ok || !data?.success) {
            throw new Error("Avatar upload failed.");
        }

        return data.data.url;
    };

    const validateForm = () => {
        if (!form.name.trim()) {
            toast.error("Full name is required.");
            return false;
        }

        if (!form.email.trim()) {
            toast.error("Email is required.");
            return false;
        }

        if (!avatarFile) {
            toast.error("Avatar is required.");
            return false;
        }

        if (!form.bloodGroup) {
            toast.error("Blood group is required.");
            return false;
        }

        if (!form.district) {
            toast.error("District is required.");
            return false;
        }

        if (!form.upazila) {
            toast.error("Upazila is required.");
            return false;
        }

        if (form.password.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return false;
        }

        if (form.password !== form.confirmPassword) {
            toast.error("Passwords do not match.");
            return false;
        }

        return true;
    };

    const handleSignup = async (event) => {
        event.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);

            const imageUrl = await uploadAvatar();
            const userEmail = form.email.trim().toLowerCase();

            const result = await authClient.signUp.email({
                name: form.name.trim(),
                email: userEmail,
                password: form.password,
                image: imageUrl,

                bloodGroup: form.bloodGroup,
                district: form.district,
                upazila: form.upazila,
                role: "donor",
                status: "active",
            });

            if (result?.error) {
                const errorMessage =
                    result.error.message ||
                    result.error.statusText ||
                    result.error.code ||
                    "Registration failed.";

                toast.error(errorMessage);
                return;
            }

            const baseUrl =
                process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

            const defaultsResponse = await fetch(`${baseUrl}/api/users/defaults`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: userEmail,
                    role: "donor",
                    status: "active",
                }),
            });

            const defaultsData = await defaultsResponse.json();

            if (!defaultsResponse.ok || !defaultsData?.success) {
                throw new Error(
                    defaultsData?.message || "User defaults update failed."
                );
            }

            await createJwtToken(userEmail);

            toast.success("Account created successfully.");
            router.push("/auth/login");
            router.refresh();
        } catch (error) {
            console.error("SIGNUP_ERROR:", error);
            toast.error(error?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100";

    const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

    return (
        <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 px-4 py-8">
            <Toaster position="top-center" />

            <section className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[1180px] items-center justify-center">
                <div className="grid w-full overflow-hidden rounded-[28px] border border-red-100 bg-white shadow-2xl shadow-red-100/70 lg:grid-cols-[0.9fr_1.1fr]">
                    {/* Left Side */}
                    <div className="hidden bg-gradient-to-br from-red-600 to-rose-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
                        <div>
                            <Link href="/" className="inline-flex items-center gap-3">
                                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-red-600 shadow-lg">
                                    <FaDroplet className="text-2xl" />
                                </span>

                                <span>
                                    <span className="block text-2xl font-black">LifeDrop</span>
                                    <span className="text-sm text-red-100">
                                        Blood Donation Platform
                                    </span>
                                </span>
                            </Link>
                        </div>

                        <div>
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
                                <FaUserPlus />
                                Donor Registration
                            </div>

                            <h1 className="max-w-md text-5xl font-black leading-tight">
                                Create your donor account.
                            </h1>

                            <p className="mt-5 max-w-md text-base leading-7 text-red-50">
                                Register with your blood group and location so people can find
                                nearby donors when urgent blood support is needed.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                            <p className="text-sm text-red-100">Already registered?</p>

                            <Link
                                href="/auth/login"
                                className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-red-600 transition hover:bg-red-50"
                            >
                                Login Account
                                <FaArrowRight />
                            </Link>
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center justify-center p-5 sm:p-8 lg:p-10">
                        <div className="w-full max-w-2xl">
                            <div className="mb-7">
                                <div className="mb-5 flex items-center gap-3 lg:hidden">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600 text-white">
                                        <FaDroplet />
                                    </span>

                                    <div>
                                        <h1 className="text-xl font-black text-slate-950">
                                            LifeDrop
                                        </h1>
                                        <p className="text-sm text-slate-500">
                                            Blood Donation Platform
                                        </p>
                                    </div>
                                </div>

                                <p className="mb-2 inline-flex rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-600">
                                    Donor Registration
                                </p>

                                <h2 className="text-3xl font-black tracking-tight text-slate-950">
                                    Create account
                                </h2>

                                <p className="mt-2 text-sm text-slate-500">
                                    Fill the required information to register as a donor.
                                </p>
                            </div>

                            {/* Toggle */}
                            <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
                                <Link
                                    href="/auth/signup"
                                    className="rounded-xl bg-white py-2.5 text-center text-sm font-black text-red-600 shadow-sm"
                                >
                                    Signup
                                </Link>

                                <Link
                                    href="/auth/login"
                                    className="rounded-xl py-2.5 text-center text-sm font-bold text-slate-500 transition hover:text-red-600"
                                >
                                    Login
                                </Link>
                            </div>

                            <form onSubmit={handleSignup} className="space-y-4">
                                {/* Avatar */}
                                <div className="flex items-center gap-4 rounded-2xl border border-red-100 bg-red-50/60 p-4">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm">
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
                                                alt="Avatar preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <FaCamera className="text-xl text-red-300" />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <label className={labelClass}>Avatar</label>

                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg,image/webp"
                                            onChange={handleAvatarChange}
                                            className="block w-full cursor-pointer rounded-xl border border-red-100 bg-white text-sm text-slate-600 file:mr-3 file:border-0 file:bg-red-600 file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-white"
                                        />

                                        <p className="mt-1 text-xs text-slate-500">
                                            JPG, PNG, WEBP. Max 2MB.
                                        </p>
                                    </div>
                                </div>

                                {/* Name + Email */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className={labelClass}>Full Name</label>

                                        <div className="relative">
                                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                                            <input
                                                type="text"
                                                value={form.name}
                                                onChange={(event) =>
                                                    updateField("name", event.target.value)
                                                }
                                                placeholder="Enter full name"
                                                className={`${inputClass} pl-11`}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Email Address</label>

                                        <div className="relative">
                                            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                                            <input
                                                type="email"
                                                value={form.email}
                                                onChange={(event) =>
                                                    updateField("email", event.target.value)
                                                }
                                                placeholder="example@email.com"
                                                className={`${inputClass} pl-11`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Blood Group */}
                                <div>
                                    <label className={labelClass}>Blood Group</label>

                                    <div className="grid grid-cols-4 gap-2">
                                        {bloodGroups.map((group) => (
                                            <button
                                                key={group}
                                                type="button"
                                                onClick={() => updateField("bloodGroup", group)}
                                                className={`rounded-xl border py-2.5 text-sm font-black transition ${form.bloodGroup === group
                                                    ? "border-red-600 bg-red-600 text-white"
                                                    : "border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
                                                    }`}
                                            >
                                                {group}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* District + Upazila */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className={labelClass}>District</label>

                                        <div className="relative">
                                            <FaLocationDot className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                                            <select
                                                value={form.districtId}
                                                onChange={(event) =>
                                                    handleDistrictChange(event.target.value)
                                                }
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
                                        <label className={labelClass}>Upazila</label>

                                        <select
                                            value={form.upazila}
                                            onChange={(event) =>
                                                updateField("upazila", event.target.value)
                                            }
                                            disabled={!form.districtId}
                                            className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}
                                        >
                                            <option value="">
                                                {form.districtId
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
                                </div>

                                {/* Password */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className={labelClass}>Password</label>

                                        <div className="relative">
                                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                                            <input
                                                type={showPass ? "text" : "password"}
                                                value={form.password}
                                                onChange={(event) =>
                                                    updateField("password", event.target.value)
                                                }
                                                placeholder="Minimum 8 characters"
                                                className={`${inputClass} pl-11 pr-11`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowPass((prev) => !prev)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                                                aria-label="Toggle password visibility"
                                            >
                                                {showPass ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {passwordLabel}
                                        </p>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Confirm Password</label>

                                        <div className="relative">
                                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                                            <input
                                                type={showConfirm ? "text" : "password"}
                                                value={form.confirmPassword}
                                                onChange={(event) =>
                                                    updateField("confirmPassword", event.target.value)
                                                }
                                                placeholder="Re-enter password"
                                                className={`${inputClass} pl-11 pr-11`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm((prev) => !prev)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                                                aria-label="Toggle confirm password visibility"
                                            >
                                                {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {loading ? "Creating Account..." : "Create Donor Account"}
                                    {!loading && <FaArrowRight />}
                                </button>

                                <p className="text-center text-sm text-slate-500">
                                    Already have an account?{" "}
                                    <Link
                                        href="/auth/login"
                                        className="font-black text-red-600 hover:underline"
                                    >
                                        Login
                                    </Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}