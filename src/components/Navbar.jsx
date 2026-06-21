"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaDroplet, FaArrowRightToBracket } from "react-icons/fa6";
import { HiMenu, HiX } from "react-icons/hi";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();

  const [user, setUser] = useState(null); 

  const handleLogout = () => {
    setUser(null);
    setIsDropdownOpen(false);
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Donation Requests", href: "/donation-requests" },
    { name: "Search Donors", href: "/search" },
    ...(user ? [{ name: "Funding", href: "/funding" }] : []),
  ];

  const isActive = (path) => pathname === path;

  return (
    // shadow-sm ব্যবহার করেছি যেন শ্যাডোটি খুব হালকা এবং প্রফেশনাল হয়
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 text-3xl font-extrabold tracking-tighter text-gray-900">
              <FaDroplet className="text-red-600" size={32} />
              <span>Life<span className="text-red-600">Drop</span></span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[15px] font-semibold transition-all duration-200 hover:text-red-600 ${
                  isActive(link.href) ? "text-red-600" : "text-gray-700"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 ring-2 ring-red-100 rounded-full focus:outline-none hover:ring-red-200 transition-all"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 rounded-xl border border-gray-100 bg-white p-2 shadow-xl z-50">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full rounded-lg px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-2 rounded-full bg-gray-900 px-7 py-2.5 text-[14px] font-bold text-white transition-all hover:bg-red-600 hover:shadow-lg focus:outline-none"
              >
                {/* লগইন বাটনে আইকন যোগ করা হয়েছে */}
                <FaArrowRightToBracket size={14} />
                Login
              </Link>
            )}
          </div>

          <div className="flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-900 p-2">
              {isOpen ? <HiX size={28} /> : <HiMenu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-gray-100 bg-white md:hidden p-6 animate-in slide-in-from-top-4">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className="text-lg font-semibold text-gray-900">
                {link.name}
              </Link>
            ))}
            {!user ? (
              <Link href="/login" onClick={() => setIsOpen(false)} className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl bg-red-600 px-4 py-3 text-lg font-bold text-white">
                <FaArrowRightToBracket size={18} />
                Login
              </Link>
            ) : (
              <div className="mt-4 border-t pt-4">
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block text-lg font-semibold text-gray-900 mb-2">Dashboard</Link>
                <button onClick={handleLogout} className="block text-lg font-semibold text-red-600">Logout</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}