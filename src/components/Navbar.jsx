"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { removeAccessToken } from "@/lib/jwt-token";
import {
  FaArrowRightToBracket,
  FaDroplet,
  FaHouse,
  FaMagnifyingGlass,
  FaRegHeart,
  FaSackDollar,
  FaUser,
} from "react-icons/fa6";
import { HiMenu, HiX } from "react-icons/hi";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();

  const { data: session } = authClient.useSession();

  const handleLogout = async () => {
    removeAccessToken();
    await authClient.signOut();
    setIsDropdownOpen(false);
    setIsOpen(false);
    window.location.href = "/";
  };

  const navLinks = [
    {
      name: "Home",
      href: "/",
      icon: FaHouse,
    },
    {
      name: "Donation Requests",
      href: "/donation-requests",
      icon: FaRegHeart,
    },
    {
      name: "Search Donors",
      href: "/search-donors",
      icon: FaMagnifyingGlass,
    },
    ...(session
      ? [
          {
            name: "Funding",
            href: "/funding",
            icon: FaSackDollar,
          },
        ]
      : []),
  ];

  const isActive = (path) => {
    if (path === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(path);
  };

  const closeMobileMenu = () => {
    setIsOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 shadow-[0_2px_4px_rgba(0,0,0,0.05)] backdrop-blur-md transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-2 text-2xl font-extrabold tracking-tighter text-gray-900 sm:text-3xl"
          >
            <FaDroplet className="text-red-600" size={30} />
            <span>
              Life<span className="text-red-600">Drop</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-10 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[15px] font-semibold transition ${
                  isActive(link.href)
                    ? "text-red-600"
                    : "text-gray-700 hover:text-red-600"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {session ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="cursor-pointer rounded-full ring-2 ring-red-100 transition-all hover:ring-red-300 focus:outline-none"
                >
                  <img
                    src={session.user.image || "/default-avatar.png"}
                    alt={session.user.name || "User"}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 z-50 mt-3 w-48 rounded-xl border border-gray-100 bg-white p-2 shadow-xl">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-red-50 hover:text-red-600"
                    >
                      Dashboard
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full cursor-pointer rounded-lg px-4 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-2 rounded-full bg-gray-900 px-7 py-2.5 text-[14px] font-bold text-white transition-all hover:bg-red-600"
              >
                <FaArrowRightToBracket />
                Login
              </Link>
            )}
          </div>

          {/* Mobile Right Actions */}
          <div className="flex items-center gap-3 md:hidden">
            {session ? (
              <Link
                href="/dashboard"
                onClick={closeMobileMenu}
                className="rounded-full ring-2 ring-red-100"
              >
                <img
                  src={session.user.image || "/default-avatar.png"}
                  alt={session.user.name || "User"}
                  className="h-10 w-10 rounded-full object-cover"
                />
              </Link>
            ) : (
              <Link
                href="/auth/login"
                onClick={closeMobileMenu}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white transition hover:bg-red-600"
                aria-label="Login"
              >
                <FaArrowRightToBracket />
              </Link>
            )}

            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-100 bg-red-50 text-2xl text-red-600 transition hover:bg-red-600 hover:text-white"
              aria-label="Toggle mobile menu"
            >
              {isOpen ? <HiX /> : <HiMenu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="border-t border-gray-100 bg-white py-4 md:hidden">
            <div className="space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition ${
                      isActive(link.href)
                        ? "bg-red-600 text-white"
                        : "bg-slate-50 text-slate-700 hover:bg-red-50 hover:text-red-600"
                    }`}
                  >
                    <Icon />
                    {link.name}
                  </Link>
                );
              })}

              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <FaUser />
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-2xl bg-red-50 px-4 py-3 text-left text-sm font-black text-red-600 transition hover:bg-red-600 hover:text-white"
                  >
                    <FaArrowRightToBracket />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 py-3 text-sm font-black text-white transition hover:bg-red-600"
                >
                  <FaArrowRightToBracket />
                  Login Account
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}