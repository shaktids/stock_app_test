import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CompanyChart = ({ companyId }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (companyId) {
      fetch()
        .then((res) => res.json())
        .then((data) => setData(data));
    }
  }, [companyId]);

  return (
    <div className="w-3/4 p-6">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-lg">Select a company to view data</p>
      )}
    </div>
  );
};

export default CompanyChart;
