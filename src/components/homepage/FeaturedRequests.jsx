"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaDroplet, FaLocationDot, FaCalendarDays, FaClock } from "react-icons/fa6";

export default function FeaturedRequests() {
  // ভবিষ্যতে এখানে API call করে ডাটা আনবে
  const requests = [
    {
      id: 1,
      recipientName: "Rahim Ahmed",
      bloodGroup: "A+",
      district: "Dhaka",
      upazila: "Mirpur",
      date: "2026-06-25",
      time: "10:00 AM"
    },
    {
      id: 2,
      recipientName: "Fatima Begum",
      bloodGroup: "O-",
      district: "Chittagong",
      upazila: "Panchlaish",
      date: "2026-06-26",
      time: "02:30 PM"
    },
    {
      id: 3,
      recipientName: "Samiul Islam",
      bloodGroup: "B+",
      district: "Khulna",
      upazila: "Sadar",
      date: "2026-06-27",
      time: "09:00 AM"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Blood Requests</h2>
            <p className="text-gray-600">Urgent blood donation requests that need your help.</p>
          </div>
          <Link 
            href="/donation-requests" 
            className="text-red-600 font-semibold hover:text-red-700 transition-colors flex items-center gap-2"
          >
            View All Requests →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <motion.div
              key={request.id}
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl border border-gray-100 bg-gray-50 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg">
                    {request.bloodGroup}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{request.recipientName}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <FaLocationDot size={12} /> {request.district}, {request.upazila}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 text-sm text-gray-600 mb-6">
                <span className="flex items-center gap-1.5"><FaCalendarDays className="text-red-500"/> {request.date}</span>
                <span className="flex items-center gap-1.5"><FaClock className="text-red-500"/> {request.time}</span>
              </div>

              <Link 
                href={`/donation-requests/${request.id}`}
                className="block w-full py-2.5 text-center bg-white border border-red-200 text-red-600 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition-all"
              >
                View Details
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}