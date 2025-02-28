import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Signup = () => {
  const navigate = useNavigate();

  const handleSignup = () => {
    navigate("/dashboard"); // Redirect after signup
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white bg-opacity-20 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-96 border border-white/30"
      >
        <h2 className="text-3xl font-extrabold text-white text-center mb-4">
          Create an Account
        </h2>
        <p className="text-white text-center mb-6">
          Join us to explore insights!
        </p>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-3 mb-3 bg-transparent border border-white/50 rounded-lg text-white placeholder-white/70 focus:ring-2 focus:ring-purple-400 outline-none"
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-3 bg-transparent border border-white/50 rounded-lg text-white placeholder-white/70 focus:ring-2 focus:ring-purple-400 outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 bg-transparent border border-white/50 rounded-lg text-white placeholder-white/70 focus:ring-2 focus:ring-purple-400 outline-none"
        />

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSignup}
          className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-700 transition"
        >
          Sign Up
        </motion.button>

        <p className="mt-4 text-center text-white">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-yellow-300 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
