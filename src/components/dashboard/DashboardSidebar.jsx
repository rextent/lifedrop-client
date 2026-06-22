"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  FaBars,
  FaDroplet,
  FaHouse,
  FaUser,
  FaPlus,
  FaList,
  FaUsers,
  FaClipboardList,
  FaRightFromBracket,
  FaXmark,
  FaMoneyBillWave,
} from "react-icons/fa6";

export default function DashboardSidebar({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();
  const sessionUser = session?.user;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    if (isPending) return;

    if (!sessionUser?.email) {
      setCurrentUser(null);
      setLoadingUser(false);
      return;
    }

    const loadCurrentUser = async () => {
      try {
        setLoadingUser(true);

        const response = await fetch(`${baseUrl}/api/auth/me`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "Failed to load current user.");
        }

        setCurrentUser(data.user);
      } catch (error) {
        console.error("SIDEBAR_CURRENT_USER_ERROR:", error);
        setCurrentUser(sessionUser || null);
      } finally {
        setLoadingUser(false);
      }
    };

    loadCurrentUser();
  }, [isPending, sessionUser?.email, baseUrl]);

  const role = currentUser?.role || sessionUser?.role || "donor";
  const userName = currentUser?.name || sessionUser?.name || "User";
  const userEmail = currentUser?.email || sessionUser?.email || "";
  const userImage =
    currentUser?.image || sessionUser?.image || "/default-avatar.png";

  const donorLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: FaHouse,
    },
    {
      name: "My Profile",
      href: "/dashboard/profile",
      icon: FaUser,
    },
    {
      name: "Create Request",
      href: "/dashboard/create-donation-request",
      icon: FaPlus,
    },
    {
      name: "My Request",
      href: "/dashboard/my-donation-requests",
      icon: FaList,
    },
  ];

  const adminLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: FaHouse,
    },
    {
      name: "My Profile",
      href: "/dashboard/profile",
      icon: FaUser,
    },
    {
      name: "Create Request",
      href: "/dashboard/create-donation-request",
      icon: FaPlus,
    },
    {
      name: "My Request",
      href: "/dashboard/my-donation-requests",
      icon: FaList,
    },
    {
      name: "All User",
      href: "/dashboard/all-users",
      icon: FaUsers,
    },
    {
      name: "Public Request",
      href: "/dashboard/all-blood-donation-request",
      icon: FaClipboardList,
    },
    {
      name: "Funding",
      href: "/dashboard/fundings",
      icon: FaMoneyBillWave,
    },
  ];

  const volunteerLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: FaHouse,
    },
    {
      name: "My Profile",
      href: "/dashboard/profile",
      icon: FaUser,
    },
    {
      name: "Create Request",
      href: "/dashboard/create-donation-request",
      icon: FaPlus,
    },
    {
      name: "My Request",
      href: "/dashboard/my-donation-requests",
      icon: FaList,
    },
    {
      name: "Public Request",
      href: "/dashboard/all-blood-donation-request",
      icon: FaClipboardList,
    },
  ];

  const dashboardLinks =
    role === "admin"
      ? adminLinks
      : role === "volunteer"
        ? volunteerLinks
        : donorLinks;

  const isActiveLink = (href) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  if (isPending || loadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Top Bar */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-100 bg-white px-4 shadow-sm lg:hidden">
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-950"
        >
          <FaDroplet className="text-red-600" />
          <span>
            Life<span className="text-red-600">Drop</span>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700"
        >
          <FaBars />
        </button>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 transform border-r border-slate-100 bg-white shadow-xl transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
            <Link
              href="/"
              className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-950"
              onClick={() => setSidebarOpen(false)}
            >
              <FaDroplet className="text-red-600" />
              <span>
                Life<span className="text-red-600">Drop</span>
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 lg:hidden"
            >
              <FaXmark />
            </button>
          </div>

          {/* User Card */}
          <div className="border-b border-slate-100 p-5">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <img
                src={userImage}
                alt={userName}
                className="h-12 w-12 rounded-2xl object-cover"
              />

              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-950">
                  {userName}
                </p>

                <p className="truncate text-xs font-medium text-slate-500">
                  {userEmail}
                </p>

                <span className="mt-1 inline-flex rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-black capitalize text-red-600">
                  {role}
                </span>
              </div>
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 space-y-2 overflow-y-auto p-4">
            {dashboardLinks.map((link) => {
              const Icon = link.icon;
              const active = isActiveLink(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition ${active
                    ? "bg-red-600 text-white shadow-sm shadow-red-200"
                    : "text-slate-600 hover:bg-red-50 hover:text-red-600"
                    }`}
                >
                  <Icon />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-slate-100 p-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-red-600 transition hover:bg-red-50"
            >
              <FaRightFromBracket />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen p-4 sm:p-6 lg:ml-72 lg:p-8">
        {children}
      </main>
    </div>
  );
}