"use client";

import { useState } from "react";

type Job = {
  id: number;
  name: string;
  reportType: string;
  tone: string;
  startTime: string;
  status: "Ongoing" | "Completed";
  progress: number;
};

export default function JobsPage() {
  const jobs: Job[] = [
    { id: 1, name: "Lions vs Tigers", reportType: "Post Match Report", tone: "Serious", startTime: "2026-04-20 14:30", status: "Completed", progress: 100 },
    { id: 2, name: "Eagles vs Hawks", reportType: "Pre Match Report", tone: "Comedy", startTime: "2026-04-21 10:00", status: "Completed", progress: 100 },
    { id: 3, name: "Round 5 Summary", reportType: "League Summary", tone: "Serious", startTime: "2026-04-22 18:00", status: "Ongoing", progress: 60 },
    { id: 4, name: "Sharks vs Bulls", reportType: "Post Match Report", tone: "Comedy", startTime: "2026-04-23 15:45", status: "Ongoing", progress: 75 },
    { id: 5, name: "Wolves vs Panthers", reportType: "Pre Match Report", tone: "Serious", startTime: "2026-04-24 09:00", status: "Completed", progress: 100 },
    { id: 6, name: "Round 6 Summary", reportType: "League Summary", tone: "Comedy", startTime: "2026-04-25 20:00", status: "Ongoing", progress: 40 },
    { id: 7, name: "Falcons vs Knights", reportType: "Post Match Report", tone: "Serious", startTime: "2026-04-26 16:20", status: "Completed", progress: 100 },
    { id: 8, name: "Dragons vs Titans", reportType: "Pre Match Report", tone: "Comedy", startTime: "2026-04-27 11:10", status: "Ongoing", progress: 50 },
    { id: 9, name: "Round 7 Summary", reportType: "League Summary", tone: "Serious", startTime: "2026-04-28 19:30", status: "Ongoing", progress: 30 },
    { id: 10, name: "Rangers vs City", reportType: "Post Match Report", tone: "Comedy", startTime: "2026-04-29 14:00", status: "Completed", progress: 100 },
    { id: 11, name: "United vs Stars", reportType: "Pre Match Report", tone: "Serious", startTime: "2026-04-30 10:00", status: "Ongoing", progress: 20 },
    { id: 12, name: "Round 8 Summary", reportType: "League Summary", tone: "Comedy", startTime: "2026-05-01 21:00", status: "Ongoing", progress: 10 },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  const indexOfLast = currentPage * jobsPerPage;
  const indexOfFirst = indexOfLast - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  return (
    <div>
      {/* Title */}
      <h1 className="text-2xl font-bold mb-6">Jobs</h1>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-sm text-gray-600">
            <tr>
              <th className="p-4">#</th>
              <th className="p-4">Job Name</th>
              <th className="p-4">Report Type</th>
              <th className="p-4">Tone</th>
              <th className="p-4">Start Time</th>
              <th className="p-4">Status</th>
              <th className="p-4">Progress</th>
            </tr>
          </thead>

          <tbody>
            {currentJobs.map((job) => (
              <tr key={job.id} className="border-t hover:bg-gray-50">
                <td className="p-4">{job.id}</td>
                <td className="p-4">{job.name}</td>
                <td className="p-4">{job.reportType}</td>
                <td className="p-4">{job.tone}</td>
                <td className="p-4">{job.startTime}</td>

                {/* Status Badge */}
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      job.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {job.status}
                  </span>
                </td>

                {/* Progress */}
                <td className="p-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${job.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">
                    {job.progress}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 space-x-2">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === index + 1
                ? "bg-gray-900 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
