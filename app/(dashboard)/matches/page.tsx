"use client";

import { useState, useEffect } from "react";

type Match = {
  id: number;
  homeTeam: string;
  awayTeam: string;
  location: string;
  datetime: string;
  status: "Ongoing" | "Completed" | "Cancelled" | "No Data";
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const matchesPerPage = 10;

  // Fetch API
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/fixtures/get-fixtures")
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.fixtures
          .map((item: any, index: number) => {
            // ❗ STRICT FILTER: skip if ANY required field missing
            if (
              !item.home_team_id ||
              !item.away_team_id ||
              !item.ground_id ||
              !item.utc_datetime
            ) {
              return null;
            }

            const dateObj = new Date(item.utc_datetime);

            // Extra safety: invalid date
            if (isNaN(dateObj.getTime())) return null;

            const formattedDate = dateObj.toLocaleDateString();
            const formattedTime = dateObj.toLocaleTimeString();

            return {
              id: index + 1,
              homeTeam: item.home_team_id,
              awayTeam: item.away_team_id,
              location: item.ground_id,
              datetime: `${formattedDate}, ${formattedTime} (${item.duration} mins)`,
              status:
                item.event_status === "completed"
                  ? "Completed"
                  : item.event_status === "ongoing"
                  ? "Ongoing"
                  : item.event_status === "cancelled"
                  ? "Cancelled"
                  : "No Data",
            };
          })
          .filter(Boolean); // remove nulls

        setMatches(mapped);
      })
      .catch((err) => console.error("API error:", err));
  }, []);

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
                          : match.status === "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-200 text-gray-700"
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
        {/* Previous */}
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          {"<"}
        </button>

        {/* Page Numbers */}
        {[currentPage - 1, currentPage, currentPage + 1]
          .filter((page) => page > 0 && page <= totalPages)
          .map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page
                  ? "bg-gray-900 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {page}
            </button>
          ))}

        {/* Next */}
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          {">"}
        </button>
      </div>
    </div>
  );
}