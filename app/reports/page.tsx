// reports/page.tsx
"use client";
import React, { useState, useEffect, useContext } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

interface Report {
  ReportID: number;
  Title: string;
  Description: string;
  CreatedDate: string;
  ReportType: string;
}

const ReportsPage = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    if (!user || (user.UserType !== "Admin" && user.UserType !== "Librarian")) {
      router.push("/login");
    } else {
      fetchReports();
    }
  }, [user, router]);

  const fetchReports = async () => {
    try {
      const response = await axiosInstance.get(
        "/backend/api/Report.php?action=getAll"
      );
      setReports(response.data.reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  return (
    <div className="reports-container">
      <h2>Reports</h2>
      <ul>
        {reports.map((report) => (
          <li key={report.ReportID}>
            <h3>{report.Title}</h3>
            <p>{report.Description}</p>
            <small>{new Date(report.CreatedDate).toLocaleString()}</small>
            {/* You can add a link to view detailed report */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReportsPage;
