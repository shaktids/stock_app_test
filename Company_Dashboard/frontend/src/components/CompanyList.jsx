import React, { useEffect, useState } from "react";

const CompanyList = ({ onSelect }) => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    fetch()
      .then((res) => res.json())
      .then((data) => setCompanies(data));
  }, []);

  return (
    <div className="w-1/4 bg-gray-100 p-4 shadow-lg">
      <h2 className="text-xl font-semibold mb-3">Companies</h2>
      {companies.map((company) => (
        <div
          key={company.id}
          className="p-3 cursor-pointer hover:bg-gray-300 rounded-md"
          onClick={() => onSelect(company.id)}
        >
          {company.name}
        </div>
      ))}
    </div>
  );
};

export default CompanyList;
