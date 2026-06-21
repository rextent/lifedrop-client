"use client";

import { motion } from "framer-motion";
import { FaUserPlus, FaMagnifyingGlass, FaHeart } from "react-icons/fa6";

export default function HowItWorks() {
  const steps = [
    {
      id: 1,
      title: "Register",
      description: "Create your account as a donor or recipient in just a few clicks. It's secure and simple.",
      icon: <FaUserPlus size={32} />,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: 2,
      title: "Search or Request",
      description: "Find blood donors in your area or post a blood donation request to get help instantly.",
      icon: <FaMagnifyingGlass size={32} />,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      id: 3,
      title: "Save Lives",
      description: "Connect with donors or recipients and make a life-changing impact through blood donation.",
      icon: <FaHeart size={32} />,
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How LifeDrop Works
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            A simple three-step process to connect with our community and start saving lives today.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
            >
              {/* Step Number Badge */}
              <div className="absolute -top-4 left-8 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                Step 0{step.id}
              </div>

              <div className={`w-16 h-16 rounded-2xl ${step.bgColor} ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {step.icon}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}