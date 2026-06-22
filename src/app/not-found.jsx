import Link from "next/link";
import { FaArrowLeft, FaDroplet, FaHouse, FaTriangleExclamation } from "react-icons/fa6";

export const metadata = {
  title: "Page Not Found | LifeDrop",
  description: "The page you are looking for could not be found.",
};

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-slate-100 bg-white text-center shadow-sm">
        <div className="bg-gradient-to-br from-red-600 to-rose-700 px-6 py-10 text-white">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 text-4xl backdrop-blur">
            <FaTriangleExclamation />
          </div>

          <h1 className="mt-6 text-6xl font-black tracking-tight">404</h1>

          <p className="mt-3 text-xl font-black">Page Not Found</p>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-red-50">
            The page you are looking for does not exist or may have been moved.
          </p>
        </div>

        <div className="space-y-5 p-6 sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl text-red-600">
            <FaDroplet />
          </div>

          <p className="text-sm leading-6 text-slate-500">
            You can go back to the homepage or explore available blood donation requests.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
            >
              <FaHouse />
              Back to Home
            </Link>

            <Link
              href="/donation-requests"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <FaArrowLeft />
              Donation Requests
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}