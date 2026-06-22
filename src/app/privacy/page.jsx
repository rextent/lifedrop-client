import Link from "next/link";
import { FaArrowLeft, FaDroplet, FaLock, FaShieldHeart } from "react-icons/fa6";

export const metadata = {
    title: "Privacy Policy | LifeDrop",
    description: "Privacy policy for the LifeDrop blood donation platform.",
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-slate-50 px-4 py-10">
            <section className="mx-auto max-w-[1100px]">
                <Link
                    href="/"
                    className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                    <FaArrowLeft />
                    Back to Home
                </Link>

                <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
                    <div className="bg-gradient-to-br from-red-600 to-rose-700 px-6 py-10 text-white sm:px-10">
                        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-black backdrop-blur">
                            <FaLock />
                            Data Protection
                        </p>

                        <h1 className="text-4xl font-black tracking-tight">
                            Privacy Policy
                        </h1>

                        <p className="mt-4 max-w-3xl text-sm leading-7 text-red-50 sm:text-base">
                            This privacy policy explains how LifeDrop collects, uses, and protects
                            user information.
                        </p>
                    </div>

                    <div className="space-y-8 p-6 sm:p-10">
                        <section>
                            <h2 className="text-2xl font-black text-slate-950">
                                1. Information We Collect
                            </h2>

                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                LifeDrop may collect user information such as name, email address,
                                avatar, blood group, district, upazila, donation request details,
                                and funding records where applicable.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-950">
                                2. How We Use Information
                            </h2>

                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                User information is used to manage accounts, create donation
                                requests, search donors by blood group and location, show dashboard
                                statistics, and improve platform functionality.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-950">
                                3. Donation Request Data
                            </h2>

                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                Public donation requests may show necessary recipient information
                                such as blood group, district, upazila, hospital name, date, and
                                time. Private requester and donor information is controlled based
                                on user role and request status.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-950">
                                4. Data Security
                            </h2>

                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                LifeDrop uses authentication and protected API access to reduce
                                unauthorized access to private dashboard features. Private APIs are
                                protected with token verification.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-950">
                                5. Account Status and Access
                            </h2>

                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                Admin users may block or unblock accounts when needed. Blocked users
                                may lose access to creating donation requests and other private
                                actions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-950">
                                6. Third-Party Services
                            </h2>

                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                LifeDrop may use third-party services for image upload, database
                                storage, authentication, hosting, and payment processing. These
                                services may process limited information required for platform
                                functionality.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-950">
                                7. Data Updates
                            </h2>

                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                Users may update their profile information from the dashboard where
                                profile editing features are available.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-950">
                                8. Contact
                            </h2>

                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                For privacy-related questions, users can contact the LifeDrop
                                project administrator through the platform contact information.
                            </p>
                        </section>

                        <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                            <p className="flex items-start gap-3 text-sm font-semibold leading-7 text-red-700">
                                <FaShieldHeart className="mt-1 shrink-0" />
                                This privacy policy is prepared for the LifeDrop project and should
                                be reviewed before using the platform in a real production
                                environment.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}