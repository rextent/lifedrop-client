"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { FaArrowRightToBracket, FaDroplet, FaLock } from "react-icons/fa6";

export default function DashboardAuthGuard({ children }) {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;

  if (isPending) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-2xl text-red-600">
            <FaDroplet />
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-950">
            Checking Access...
          </h1>

          <p className="mt-2 text-sm font-medium text-slate-500">
            Please wait while we verify your session.
          </p>
        </div>
      </section>
    );
  }

  if (!user?.email) {
    const loginUrl = `/auth/login?redirect=${encodeURIComponent(
      pathname || "/dashboard"
    )}`;

    return (
      <section className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-2xl text-red-600">
            <FaLock />
          </div>

          <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-black text-red-600">
            Unauthorized Access
          </p>

          <h1 className="mt-4 text-3xl font-black text-slate-950">
            Please login first
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            You need to login before accessing the dashboard.
          </p>

          <Link
            href={loginUrl}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-sm font-black text-white transition hover:bg-red-700"
          >
            <FaArrowRightToBracket />
            Login Now
          </Link>
        </div>
      </section>
    );
  }

  return children;
}