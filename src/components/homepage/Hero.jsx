"use client";

import Link from "next/link";
import { FaDroplet, FaMagnifyingGlass, FaHeartPulse } from "react-icons/fa6";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-red-50/50 pt-16 md:pt-24 lg:pt-32 pb-16 md:pb-24">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-red-100 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
        <div className="absolute top-0 right-20 w-48 h-48 bg-rose-100 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-40 h-40 bg-pink-100 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-semibold mb-6 shadow-sm">
              <FaHeartPulse className="animate-pulse" />
              <span>Donate Blood, Save Lives</span>
            </div>
            
            {/* Updated Heading for perfect alignment */}
            <h1 className="text-4xl md:text-5xl lg:text-[52px] xl:text-6xl font-bold tracking-tight text-gray-900 leading-[1.15] mb-6 text-balance">
              Your Single Drop of Blood,
              <span className="block mt-2 md:mt-3 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">
                Someone Else's Hope
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              LifeDrop is a trusted platform that instantly connects blood donors with those in need. Join our community today and take a step forward in saving humanity.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/register" 
                className="group flex items-center justify-center gap-2 rounded-xl bg-red-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-red-200 transition-all duration-300 hover:bg-red-700 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <FaDroplet className="group-hover:animate-bounce" />
                Join as a donor
              </Link>
              
              <Link 
                href="/search" 
                className="group flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-red-600 border-2 border-red-100 shadow-sm transition-all duration-300 hover:border-red-600 hover:bg-red-50 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <FaMagnifyingGlass className="text-red-500 transition-colors group-hover:text-red-600" />
                Search Donors
              </Link>
            </div>
          </motion.div>

          {/* Image/Visual Content */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative lg:ml-auto w-full max-w-lg mx-auto"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-900/10">
              <img 
                src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=1000&auto=format&fit=crop" 
                alt="Blood Donation" 
                className="w-full h-auto object-cover transform transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
            
            {/* Floating Badge */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl ring-1 ring-gray-900/5 flex items-center gap-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <FaDroplet size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Live Requests</p>
                <p className="text-xs text-gray-500">20+ Pending Donors</p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}