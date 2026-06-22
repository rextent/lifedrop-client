import Link from "next/link";
import { FaArrowLeft, FaDroplet, FaShieldHeart } from "react-icons/fa6";

export const metadata = {
    title: "Terms & Conditions | LifeDrop",
    description: "Terms and conditions for using the LifeDrop blood donation platform.",
};

export default function TermsPage() {
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
                            <FaShieldHeart />
                            LifeDrop Policy
                        </p>

                        <h1 className="text-4xl font-black tracking-tight">
                            Terms & Conditions
                        </h1>

                        <p className="mt-4 max-w-3xl text-sm leading-7 text-red-50 sm:text-base">
                            Please read these terms carefully before using the LifeDrop blood
                            donation platform.
                        </p>
                    </div>

                    <div className="space-y-8 p-6 sm:p-10">
                        <section>
                            <h2 className="text-2xl font-black text-slate-950">
                                1. Platform Purpose
                            </h2>

                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                LifeDrop is a blood donation management platform designed to help
                                users create blood donation requests, search for donors, and manage
                                donation-related activities. The platform is built for educational
                                and project demonstration purposes.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-950">
                                2. User Accounts
                            </h2>

                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                Users are responsible for providing accurate account information,
                                including name, email, blood group, district, and upazila. Users
                                should not create fake requests or provide misleading information.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-950">
                                3. Donation Requests
                            </h2>

                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                Donors can create blood donation requests with recipient details,
                                hospital information, location, required blood group, date, time,
                                and request message. Blocked users are not allowed to create new
                                donation requests.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-950">
                                4. Admin and Volunteer Actions
                            </h2>

                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                Admins and volunteers may review public donation requests and
                                update request status based on platform rules. Admin users may also
                                manage users, roles, and account status where required.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-950">
                                5. User Responsibility
                            </h2>

                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                Users should communicate respectfully, avoid misuse of donor
                                information, and only submit real and necessary donation requests.
                                Any misuse of the platform may result in account restrictions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-950">
                                6. Service Availability
                            </h2>

                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                LifeDrop may update, modify, or temporarily limit access to certain
                                features for maintenance, security, or improvement purposes.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-950">
                                7. Contact
                            </h2>

                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                For questions about these terms, users can contact the LifeDrop
                                project administrator through the platform contact information.
                            </p>
                        </section>

                        <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                            <p className="flex items-start gap-3 text-sm font-semibold leading-7 text-red-700">
                                <FaDroplet className="mt-1 shrink-0" />
                                These terms are prepared for the LifeDrop project and should be
                                customized before using the platform for real-world operations.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}