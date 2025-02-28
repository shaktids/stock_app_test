import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion"; // ✅ Add animation

const Home = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500 text-white">
      {/* Animated Heading */}
      <motion.h1
        className="text-5xl md:text-6xl font-extrabold text-center mb-4"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Welcome to Company Dashboard
      </motion.h1>

      {/* Animated Subtext */}
      <motion.p
        className="text-lg md:text-xl text-center max-w-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        Track and analyze company performance with beautiful interactive charts.
      </motion.p>

      {/* Call-to-Action Button */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Link
          to="/login"
          className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105 hover:bg-gray-200"
        >
          Get Started →
        </Link>
      </motion.div>
    </div>
  );
};

export default Home;
