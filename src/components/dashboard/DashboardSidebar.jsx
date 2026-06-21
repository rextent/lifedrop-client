"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Drawer, useOverlayState } from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import {
  FaBars,
  FaDroplet,
  FaHouse,
  FaIdCard,
  FaListCheck,
  FaPlus,
  FaUser,
  FaXmark,
} from "react-icons/fa6";

const donorMenuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: FaHouse,
  },
  {
    label: "My Profile",
    href: "/dashboard/profile",
    icon: FaIdCard,
  },
  {
    label: "My Donation Requests",
    href: "/dashboard/my-donation-requests",
    icon: FaListCheck,
  },
  {
    label: "Create Donation Request",
    href: "/dashboard/create-donation-request",
    icon: FaPlus,
  },
];

export default function DashboardSidebar({ children }) {
  const pathname = usePathname();
  const drawerState = useOverlayState({ defaultOpen: false });

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const isActiveRoute = (href) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  };

  const SidebarContent = ({ isMobile = false }) => {
    return (
      <aside className="flex h-full flex-col bg-white">
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-100">
              <FaDroplet className="text-xl" />
            </span>

            <span>
              <span className="block text-xl font-black leading-none text-slate-950">
                LifeDrop
              </span>
              <span className="text-xs font-medium text-slate-500">
                Donor Dashboard
              </span>
            </span>
          </Link>

          {isMobile && (
            <button
              type="button"
              onClick={drawerState.close}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
              aria-label="Close dashboard menu"
            >
              <FaXmark />
            </button>
          )}
        </div>

        {/* User Card */}
        <div className="border-b border-slate-100 px-5 py-5">
          <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-red-500 shadow-sm">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user?.name || "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FaUser />
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-950">
                {isPending ? "Loading..." : user?.name || "Donor User"}
              </p>

              <p className="truncate text-xs font-medium text-slate-500">
                {user?.email || "donor@example.com"}
              </p>

              <span className="mt-1 inline-flex rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                {user?.role || "donor"}
              </span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-1 px-4 py-5">
          {donorMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActiveRoute(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (isMobile) drawerState.close();
                }}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  active
                    ? "bg-red-600 text-white shadow-lg shadow-red-100"
                    : "text-slate-600 hover:bg-red-50 hover:text-red-600"
                }`}
              >
                <Icon className="text-base" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Info */}
        <div className="border-t border-slate-100 p-5">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500">
              Current Panel
            </p>
            <p className="mt-1 text-sm font-black text-slate-900">
              Donor Dashboard
            </p>
          </div>
        </div>
      </aside>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="fixed left-0 top-0 z-30 hidden h-screen w-[290px] border-r border-slate-100 bg-white lg:block">
        <SidebarContent />
      </div>

      {/* Mobile Drawer */}
      <Drawer state={drawerState}>
        <Drawer.Backdrop variant="blur">
          <Drawer.Content placement="left">
            <Drawer.Dialog
              aria-label="Dashboard navigation"
              className="h-full w-[310px] bg-white"
            >
              <Drawer.Body className="p-0">
                <SidebarContent isMobile />
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>

      {/* Mobile Menu Button Only */}
      <button
        type="button"
        onClick={drawerState.open}
        className="fixed left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-red-600 shadow-lg shadow-slate-200 lg:hidden"
        aria-label="Open dashboard menu"
      >
        <FaBars />
      </button>

      {/* Main Content */}
      <div className="lg:pl-[290px]">
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}