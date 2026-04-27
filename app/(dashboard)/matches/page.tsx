"use client";

import { useState } from "react";

type Match = {
  id: number;
  homeTeam: string;
  awayTeam: string;
  location: string;
  datetime: string;
  status: "Ongoing" | "Completed" | "Cancelled";
};

export default function MatchesPage() {
  const matches: Match[] = [
    { id: 1, homeTeam: "Sydney FC", awayTeam: "Melbourne Victory", location: "Sydney", datetime: "20 Apr 2026, 10:00 AM", status: "Completed" },
    { id: 2, homeTeam: "Brisbane Roar", awayTeam: "Perth Glory", location: "Brisbane", datetime: "20 Apr 2026, 11:30 AM", status: "Ongoing" },
    { id: 3, homeTeam: "Adelaide United", awayTeam: "Western Sydney", location: "Adelaide", datetime: "20 Apr 2026, 1:00 PM", status: "Completed" },
    { id: 4, homeTeam: "Newcastle Jets", awayTeam: "Macarthur FC", location: "Newcastle", datetime: "20 Apr 2026, 2:30 PM", status: "Cancelled" },
    { id: 5, homeTeam: "Central Coast", awayTeam: "Wellington Phoenix", location: "Gosford", datetime: "20 Apr 2026, 3:00 PM", status: "Completed" },
    { id: 6, homeTeam: "Melbourne City", awayTeam: "Sydney FC", location: "Melbourne", datetime: "20 Apr 2026, 4:00 PM", status: "Ongoing" },
    { id: 7, homeTeam: "Perth Glory", awayTeam: "Adelaide United", location: "Perth", datetime: "20 Apr 2026, 5:30 PM", status: "Completed" },
    { id: 8, homeTeam: "Western United", awayTeam: "Brisbane Roar", location: "Melbourne", datetime: "20 Apr 2026, 6:00 PM", status: "Completed" },
    { id: 9, homeTeam: "Macarthur FC", awayTeam: "Central Coast", location: "Sydney", datetime: "20 Apr 2026, 7:00 PM", status: "Ongoing" },
    { id: 10, homeTeam: "Wellington Phoenix", awayTeam: "Newcastle Jets", location: "Wellington", datetime: "20 Apr 2026, 8:00 PM", status: "Completed" },

    { id: 11, homeTeam: "Sydney FC", awayTeam: "Perth Glory", location: "Sydney", datetime: "21 Apr 2026, 10:00 AM", status: "Completed" },
    { id: 12, homeTeam: "Melbourne Victory", awayTeam: "Brisbane Roar", location: "Melbourne", datetime: "21 Apr 2026, 11:30 AM", status: "Ongoing" },
    { id: 13, homeTeam: "Adelaide United", awayTeam: "Central Coast", location: "Adelaide", datetime: "21 Apr 2026, 1:00 PM", status: "Completed" },
    { id: 14, homeTeam: "Newcastle Jets", awayTeam: "Western United", location: "Newcastle", datetime: "21 Apr 2026, 2:30 PM", status: "Cancelled" },
    { id: 15, homeTeam: "Macarthur FC", awayTeam: "Wellington Phoenix", location: "Sydney", datetime: "21 Apr 2026, 3:00 PM", status: "Completed" },
    { id: 16, homeTeam: "Melbourne City", awayTeam: "Adelaide United", location: "Melbourne", datetime: "21 Apr 2026, 4:00 PM", status: "Ongoing" },
    { id: 17, homeTeam: "Perth Glory", awayTeam: "Sydney FC", location: "Perth", datetime: "21 Apr 2026, 5:30 PM", status: "Completed" },
    { id: 18, homeTeam: "Western Sydney", awayTeam: "Melbourne Victory", location: "Sydney", datetime: "21 Apr 2026, 6:00 PM", status: "Completed" },
    { id: 19, homeTeam: "Central Coast", awayTeam: "Newcastle Jets", location: "Gosford", datetime: "21 Apr 2026, 7:00 PM", status: "Ongoing" },
    { id: 20, homeTeam: "Wellington Phoenix", awayTeam: "Macarthur FC", location: "Wellington", datetime: "21 Apr 2026, 8:00 PM", status: "Completed" },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const matchesPerPage = 10;

  const indexOfLast = currentPage * matchesPerPage;
  const indexOfFirst = indexOfLast - matchesPerPage;
  const currentMatches = matches.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(matches.length / matchesPerPage);

  return (
    <div>
      {/* Title */}
      <h1 className="text-2xl font-bold mb-6">Match Details</h1>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-sm text-gray-600">
            <tr>
              <th className="p-4">#</th>
              <th className="p-4">Home Team</th>
              <th className="p-4">Away Team</th>
              <th className="p-4">Location</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentMatches.map((match) => {
              const [date, time] = match.datetime.split(",");

              return (
                <tr key={match.id} className="border-t hover:bg-gray-50">
                  <td className="p-4">{match.id}</td>
                  <td className="p-4">{match.homeTeam}</td>
                  <td className="p-4">{match.awayTeam}</td>
                  <td className="p-4">{match.location}</td>

                  {/* Date + Time Split UI */}
                  <td className="p-4">
                    <div className="text-sm font-medium text-gray-800">
                      {date}
                    </div>
                    <div className="text-xs text-gray-500">
                      {time}
                    </div>
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        match.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : match.status === "Ongoing"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {match.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm">
                      Generate Report
                    </button>
                  </td>
                </tr>
              );
            })}
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
