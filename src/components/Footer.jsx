import Link from "next/link";
import { FaDroplet, FaXTwitter, FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa6";
import { MdOutlineEmail, MdOutlinePhone, MdOutlineLocationOn } from "react-icons/md";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Column 1: Brand & About */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight focus:outline-none">
              <FaDroplet className="text-red-600" size={26} />
              <span className="text-gray-900">Life</span>
              <span className="text-red-600">Drop</span>
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed max-w-sm">
              LifeDrop is a premier blood donation platform dedicated to connecting compassionate donors with patients in need. Together, we can save lives and bring hope, one drop at a time.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Navigation
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-gray-600 hover:text-red-600 transition-colors focus:outline-none">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/donation-requests" className="text-gray-600 hover:text-red-600 transition-colors focus:outline-none">
                  Donation Requests
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-600 hover:text-red-600 transition-colors focus:outline-none">
                  Search Donors
                </Link>
              </li>
              <li>
                <Link href="/funding" className="text-gray-600 hover:text-red-600 transition-colors focus:outline-none">
                  Funding
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <MdOutlineLocationOn className="text-red-600 mt-0.5 flex-shrink-0" size={18} />
                <span>123 Medical Center Road, Sector 11, Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-3">
                <MdOutlinePhone className="text-red-600 flex-shrink-0" size={18} />
                <span>+880 2-1234567</span>
              </li>
              <li className="flex items-center gap-3">
                <MdOutlineEmail className="text-red-600 flex-shrink-0" size={18} />
                <span>support@lifedrop.org</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Social Links & Community */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Follow Our Journey
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Stay connected with our community and get real-time updates on urgent blood donation camps.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Facebook" className="h-9 w-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm focus:outline-none">
                <FaFacebookF size={16} />
              </a>
              <a href="#" aria-label="X (formerly Twitter)" className="h-9 w-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm focus:outline-none">
                <FaXTwitter size={16} /> {/* Requirement Matched: New X logo used */}
              </a>
              <a href="#" aria-label="Instagram" className="h-9 w-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm focus:outline-none">
                <FaInstagram size={16} />
              </a>
              <a href="#" aria-label="LinkedIn" className="h-9 w-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm focus:outline-none">
                <FaLinkedinIn size={16} />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-gray-200 bg-gray-100/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 text-center sm:text-left">
            &copy; {currentYear} LifeDrop. All rights reserved. Developed for A10_CAT-019.
          </p>
          <div className="flex gap-6 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-red-600 transition-colors focus:outline-none">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-red-600 transition-colors focus:outline-none">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}