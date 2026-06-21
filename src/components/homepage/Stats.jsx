"use client";

import { motion } from "framer-motion";
import { FaUsers, FaHandHoldingDroplet, FaCheckDouble, FaSackDollar } from "react-icons/fa6";

export default function Stats() {
  // Pore tumi ekhane useState ebong useEffect use kore MongoDB theke data fetch korbe
  const stats = [
    { 
      id: 1, 
      label: "Total Donors", 
      value: "1,250+", 
      icon: <FaUsers className="text-red-600" size={24} />,
      bgColor: "bg-red-50"
    },
    { 
      id: 2, 
      label: "Blood Requests", 
      value: "840+", 
      icon: <FaHandHoldingDroplet className="text-red-600" size={24} />,
      bgColor: "bg-rose-50"
    },
    { 
      id: 3, 
      label: "Successful Donations", 
      value: "720+", 
      icon: <FaCheckDouble className="text-red-600" size={24} />,
      bgColor: "bg-orange-50"
    },
    { 
      id: 4, 
      label: "Total Funds Raised", 
      value: "$15k+", 
      icon: <FaSackDollar className="text-red-600" size={24} />,
      bgColor: "bg-yellow-50"
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Impact at a Glance
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We are growing every day thanks to our amazing community of donors and supporters.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className={`flex items-center justify-center h-14 w-14 rounded-xl ${stat.bgColor} mb-6`}>
                {stat.icon}
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}