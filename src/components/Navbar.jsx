"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client"; // তোমার পাথ অনুযায়ী চেক করে নিও
import { FaDroplet, FaArrowRightToBracket } from "react-icons/fa6";
import { HiMenu, HiX } from "react-icons/hi";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();

  // BetterAuth থেকে সেশন এবং ইউজার ডাটা নিচ্ছি
  const { data: session } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut();
    setIsDropdownOpen(false);
    window.location.href = "/"; // লগআউটের পর হোমপেজে রিডাইরেক্ট
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Donation Requests", href: "/donation-requests" },
    { name: "Search Donors", href: "/search" },
    ...(session ? [{ name: "Funding", href: "/funding" }] : []),
  ];

  const isActive = (path) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-3xl font-extrabold tracking-tighter text-gray-900">
            <FaDroplet className="text-red-600" size={32} />
            <span>Life<span className="text-red-600">Drop</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:gap-10">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`text-[15px] font-semibold ${isActive(link.href) ? "text-red-600" : "text-gray-700"}`}>
                {link.name}
              </Link>
            ))}

            {/* সেশন থাকলে প্রোফাইল আইকন, না থাকলে লগইন বাটন */}
            {session ? (
              <div className="relative">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="rounded-full ring-2 ring-red-100 focus:outline-none hover:ring-red-200 transition-all">
                  <img src={session.user.image || "/default-avatar.png"} alt="User" className="h-10 w-10 rounded-full object-cover" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 rounded-xl border border-gray-100 bg-white p-2 shadow-xl z-50">
                    <Link href="/dashboard" onClick={() => setIsDropdownOpen(false)} className="block rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-red-50">Dashboard</Link>
                    <button onClick={handleLogout} className="block w-full rounded-lg px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="flex items-center gap-2 rounded-full bg-gray-900 px-7 py-2.5 text-[14px] font-bold text-white hover:bg-red-600 transition-all">
                <FaArrowRightToBracket /> Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}