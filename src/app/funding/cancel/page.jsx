import Link from "next/link";
import { FaArrowRight, FaCircleXmark } from "react-icons/fa6";

export default function FundingCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-xl rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
          <FaCircleXmark size={34} />
        </div>

        <h1 className="mt-5 text-3xl font-black text-slate-950">
          Payment Canceled
        </h1>

        <p className="mt-3 text-sm font-semibold text-slate-500">
          Your funding payment was canceled. You can try again anytime.
        </p>

        <Link
          href="/funding"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
        >
          Back to Funding
          <FaArrowRight />
        </Link>
      </div>
    </main>
  );
}