"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import toast, { Toaster } from "react-hot-toast";
import {
  FaArrowRight,
  FaDroplet,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaRightToBracket,
} from "react-icons/fa6";
import { createJwtToken } from "@/lib/jwt-token";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!form.email.trim()) {
      toast.error("Please enter your email address.");
      return false;
    }

    if (!form.password) {
      toast.error("Please enter your password.");
      return false;
    }

    return true;
  };


  const handleLogin = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const userEmail = form.email.trim().toLowerCase();

      const result = await authClient.signIn.email({
        email: userEmail,
        password: form.password,
      });

      console.log("LOGIN_RESULT:", result);

      if (result?.error) {
        const errorMessage =
          result.error.message ||
          result.error.statusText ||
          result.error.code ||
          "Login failed. Please check your email and password.";

        toast.error(errorMessage);
        return;
      }

      await createJwtToken(userEmail);

      toast.success("Login successful.");

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("LOGIN_ERROR:", error);

      toast.error(error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100";

  const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 px-4 py-8">
      <Toaster position="top-center" />

      <section className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[1100px] items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-red-100 bg-white shadow-2xl shadow-red-100/70 lg:grid-cols-[0.95fr_1.05fr]">
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
                <FaRightToBracket />
                Donor Login
              </div>

              <h1 className="max-w-md text-5xl font-black leading-tight">
                Welcome back to your donor account.
              </h1>

              <p className="mt-5 max-w-md text-base leading-7 text-red-50">
                Login to manage your donor profile, donation requests, and
                account activity.
              </p>
            </div>

            <div className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-red-100">New to LifeDrop?</p>

              <Link
                href="/auth/signup"
                className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-red-600 transition hover:bg-red-50"
              >
                Create Donor Account
                <FaArrowRight />
              </Link>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center justify-center p-5 sm:p-8 lg:p-12">
            <div className="w-full max-w-md">
              <div className="mb-8">
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
                  Login Account
                </p>

                <h2 className="text-3xl font-black tracking-tight text-slate-950">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Enter your email and password to continue.
                </p>
              </div>

              {/* Toggle */}
              <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
                <Link
                  href="/auth/signup"
                  className="rounded-xl py-2.5 text-center text-sm font-bold text-slate-500 transition hover:text-red-600"
                >
                  Signup
                </Link>

                <Link
                  href="/auth/login"
                  className="rounded-xl bg-white py-2.5 text-center text-sm font-black text-red-600 shadow-sm"
                >
                  Login
                </Link>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
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

                <div>
                  <label className={labelClass}>Password</label>

                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(event) =>
                        updateField("password", event.target.value)
                      }
                      placeholder="Enter your password"
                      className={`${inputClass} pl-11 pr-11`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Logging in..." : "Login Account"}
                  {!loading && <FaArrowRight />}
                </button>

                <p className="text-center text-sm text-slate-500">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/auth/signup"
                    className="font-black text-red-600 hover:underline"
                  >
                    Create account
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