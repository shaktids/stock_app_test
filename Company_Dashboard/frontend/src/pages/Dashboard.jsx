import React, { useState } from "react";
import CompanyList from "../components/CompanyList";
import CompanyChart from "../components/CompanyChart";
import { motion } from "framer-motion"; // ✅ Add animations
import { Menu } from "lucide-react"; // ✅ Modern menu icon for mobile

const Dashboard = () => {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // ✅ Sidebar toggle for mobile

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar (Company List) */}
      <motion.div
        className={`w-1/4 bg-white shadow-lg p-4 border-r border-gray-200 md:block ${
          isSidebarOpen ? "block" : "hidden"
        }`}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <CompanyList onSelect={setSelectedCompany} />
      </motion.div>

      {/* Main Content (Chart) */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Navbar */}
        <div className="md:hidden flex items-center p-4 bg-white shadow-lg">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="text-gray-700 w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold ml-4">Dashboard</h1>
        </div>

        {/* Chart Section */}
        <motion.div
          className="flex-1 p-6 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {selectedCompany ? (
            <CompanyChart companyId={selectedCompany} />
          ) : (
            <p className="text-gray-500 text-lg">
              Select a company to view data
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
