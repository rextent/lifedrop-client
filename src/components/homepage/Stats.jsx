"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaHandHoldingDroplet,
  FaCheckDouble,
  FaSackDollar,
} from "react-icons/fa6";

const formatNumber = (value) => {
  const number = Number(value) || 0;

  if (number >= 1000) {
    return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1)}k+`;
  }

  return `${number}+`;
};

const formatMoney = (value) => {
  const number = Number(value) || 0;

  if (number >= 1000) {
    return `$${(number / 1000).toFixed(number >= 10000 ? 0 : 1)}k+`;
  }

  return `$${number}`;
};

export default function Stats() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

  const [statsData, setStatsData] = useState({
    totalDonors: 0,
    totalRequests: 0,
    successfulDonations: 0,
    totalFundsRaised: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${baseUrl}/api/public/stats`, {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "Failed to load stats.");
        }

        setStatsData({
          totalDonors: data?.stats?.totalDonors || 0,
          totalRequests: data?.stats?.totalRequests || 0,
          successfulDonations: data?.stats?.successfulDonations || 0,
          totalFundsRaised: data?.stats?.totalFundsRaised || 0,
        });
      } catch (error) {
        console.error("HOME_STATS_ERROR:", error);

        setStatsData({
          totalDonors: 0,
          totalRequests: 0,
          successfulDonations: 0,
          totalFundsRaised: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [baseUrl]);

  const stats = [
    {
      id: 1,
      label: "Total Donors",
      value: loading ? "..." : formatNumber(statsData.totalDonors),
      icon: <FaUsers className="text-red-600" size={24} />,
      bgColor: "bg-red-50",
    },
    {
      id: 2,
      label: "Blood Requests",
      value: loading ? "..." : formatNumber(statsData.totalRequests),
      icon: <FaHandHoldingDroplet className="text-red-600" size={24} />,
      bgColor: "bg-rose-50",
    },
    {
      id: 3,
      label: "Successful Donations",
      value: loading ? "..." : formatNumber(statsData.successfulDonations),
      icon: <FaCheckDouble className="text-red-600" size={24} />,
      bgColor: "bg-orange-50",
    },
    {
      id: 4,
      label: "Total Funds Raised",
      value: loading ? "..." : formatMoney(statsData.totalFundsRaised),
      icon: <FaSackDollar className="text-red-600" size={24} />,
      bgColor: "bg-yellow-50",
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-3 inline-flex rounded-full bg-red-50 px-4 py-2 text-sm font-black uppercase tracking-wide text-red-600">
            Platform Impact
          </p>

          <h2 className="mb-4 text-3xl font-black text-gray-900 md:text-4xl">
            Our Impact at a Glance
          </h2>

          <p className="mx-auto max-w-2xl text-gray-600">
            Live overview of LifeDrop donors, blood requests, completed
            donations, and organization funding.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl ${stat.bgColor}`}
              >
                {stat.icon}
              </div>

              <h3 className="mb-1 text-3xl font-black text-gray-900">
                {stat.value}
              </h3>

              <p className="text-sm font-bold uppercase tracking-wide text-gray-500">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}