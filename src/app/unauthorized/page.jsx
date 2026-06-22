import Link from "next/link";
import {
  FaArrowRightToBracket,
  FaDroplet,
  FaHouse,
  FaLock,
  FaShieldHeart,
} from "react-icons/fa6";

export const metadata = {
  title: "Unauthorized Access | LifeDrop",
  description: "You do not have permission to access this page.",
};

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-slate-100 bg-white text-center shadow-sm">
        <div className="bg-gradient-to-br from-red-600 to-rose-700 px-6 py-10 text-white">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 text-4xl backdrop-blur">
            <FaLock />
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight">
            Unauthorized Access
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-red-50">
            You do not have permission to access this page or your login session may be missing.
          </p>
        </div>

        <div className="space-y-5 p-6 sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl text-red-600">
            <FaShieldHeart />
          </div>

          <p className="text-sm leading-6 text-slate-500">
            Please login again with the correct account. If you are trying to access an admin or volunteer page, make sure your account has the required role.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
            >
              <FaArrowRightToBracket />
              Login Again
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <FaHouse />
              Back to Home
            </Link>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
            <p className="flex items-start justify-center gap-2 text-sm font-bold leading-6 text-red-700">
              <FaDroplet className="mt-1 shrink-0" />
              LifeDrop protects private dashboard pages with JWT token and role-based access.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}