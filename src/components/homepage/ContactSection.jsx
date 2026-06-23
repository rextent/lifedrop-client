"use client";

import { useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-10" 
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2000&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      ></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: Contact Details */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Get In Touch</h2>
              <p className="text-gray-600 leading-relaxed">
                We are always here to help. Reach out to us for any blood donation queries, volunteer opportunities, or support.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="h-12 w-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-200">
                  <FaPhoneAlt size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Call Us Anytime</p>
                  <p className="text-lg font-bold text-gray-900">+880 1234 567 890</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="h-12 w-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-200">
                  <FaEnvelope size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Email Address</p>
                  <p className="text-lg font-bold text-gray-900">support@lifedrop.org</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="h-12 w-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-200">
                  <FaMapMarkerAlt size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Our Location</p>
                  <p className="text-lg font-bold text-gray-900">123 Medical Road, Dhaka, BD</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl shadow-gray-200 border border-gray-100">
            <form className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full cursor-pointer py-4 bg-gray-900 hover:bg-red-600 text-white font-bold rounded-xl transition-all duration-300 shadow-xl shadow-red-200"
              >
                Send Message Now
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}