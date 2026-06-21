"use client";

import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { FaDroplet, FaArrowRight } from "react-icons/fa6";

export default function AuthShell({ mode = "signup", children }) {
  const isSignup = mode === "signup";

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 px-4 py-6 sm:px-6 lg:px-8">
      <Toaster position="top-center" />

      <section className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-[1180px] items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-red-100 bg-white shadow-2xl shadow-red-100/70 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="p-5 sm:p-8 lg:p-10">{children}</div>

          <aside className="relative hidden overflow-hidden bg-gradient-to-br from-red-600 to-rose-700 p-10 text-white lg:block">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 flex h-full flex-col justify-between">
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

              <div className="py-12">
                <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
                  {isSignup ? "Become a donor today" : "Welcome back donor"}
                </p>

                <h1 className="max-w-md text-5xl font-black leading-tight">
                  {isSignup
                    ? "Your blood can save someone’s life."
                    : "Continue your donor journey."}
                </h1>

                <p className="mt-5 max-w-md text-base leading-7 text-red-50">
                  {isSignup
                    ? "Create your donor profile with your blood group and location so recipients can find support faster."
                    : "Login to manage your profile, donation requests, and activity from your dashboard."}
                </p>

                <div className="mt-8 rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm text-red-100">
                    {isSignup
                      ? "Already registered?"
                      : "New to LifeDrop?"}
                  </p>

                  <Link
                    href={isSignup ? "/auth/login" : "/auth/signup"}
                    className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-red-600 transition hover:bg-red-50"
                  >
                    {isSignup ? "Login Account" : "Create Donor Account"}
                    <FaArrowRight />
                  </Link>
                </div>
              </div>

              <p className="text-sm text-red-100">
                Default registration role:{" "}
                <strong className="text-white">donor</strong>
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}