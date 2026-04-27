"use client";

import { useState } from "react";

export default function ReportsPage() {
  const reports = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    name: `Match Report ${i + 1}`,
    type:
      i % 3 === 0
        ? "Post Match Report"
        : i % 3 === 1
        ? "Pre Match Report"
        : "League Summary Report",
    createdAt: `2026-04-${(i % 28) + 1} 18:00`,
    tone: i % 2 === 0 ? "Serious" : "Comedy",
  }));

  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 10;

  // Pagination logic
  const indexOfLast = currentPage * reportsPerPage;
  const indexOfFirst = indexOfLast - reportsPerPage;
  const currentReports = reports.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(reports.length / reportsPerPage);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Report Details</h1>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">#</th>
              <th className="p-4">Report Name</th>
              <th className="p-4">Report Type</th>
              <th className="p-4">Created At</th>
              <th className="p-4">Tone</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentReports.map((report) => (
              <tr
                key={report.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-4">{report.id}</td>
                <td className="p-4 font-medium">{report.name}</td>
                <td className="p-4">{report.type}</td>
                <td className="p-4">{report.createdAt}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      report.tone === "Comedy"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {report.tone}
                  </span>
                </td>
                <td className="p-4 space-x-2">
                  <button className="px-3 py-1 text-sm bg-gray-900 text-white rounded">
                    View
                  </button>
                  <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded">
                    Edit
                  </button>
                  <button className="px-3 py-1 text-sm bg-green-500 text-white rounded">
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => setCurrentPage(num)}
            className={`px-4 py-2 rounded ${
              currentPage === num
                ? "bg-gray-900 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}