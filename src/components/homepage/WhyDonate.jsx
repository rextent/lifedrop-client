"use client";

import { motion } from "framer-motion";
import { FaHeart, FaUserGroup, FaTruckMedical, FaNotesMedical } from "react-icons/fa6";

export default function WhyDonate() {
  const benefits = [
    {
      title: "Save Lives",
      description: "Your single donation can save up to three lives. Be a hero for someone in need.",
      icon: <FaHeart />,
      color: "text-red-500",
      bg: "bg-red-50"
    },
    {
      title: "Build Community",
      description: "Join a network of compassionate individuals dedicated to supporting one another.",
      icon: <FaUserGroup />,
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      title: "Emergency Support",
      description: "Your registration ensures that blood is available during critical medical emergencies.",
      icon: <FaTruckMedical />,
      color: "text-amber-500",
      bg: "bg-amber-50"
    },
    {
      title: "Health Benefits",
      description: "Regular blood donation helps improve cardiovascular health and reduces iron overload.",
      icon: <FaNotesMedical />,
      color: "text-emerald-500",
      bg: "bg-emerald-50"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Become a Donor?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Becoming a blood donor is a simple yet powerful way to contribute to society and make a difference.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl border border-gray-100 bg-white hover:border-red-100 hover:shadow-lg transition-all duration-300"
            >
              <div className={`h-14 w-14 rounded-xl ${item.bg} ${item.color} flex items-center justify-center text-2xl mb-6`}>
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}